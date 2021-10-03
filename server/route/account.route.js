const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const route = express.Router();
const connection = require("../module/mysql-connector");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Math.random().toString(36).substring(2) + Date.now() + ".jpg"); //Appending .jpg
  },
});
const uploadPath = "./public/uploads/";
var upload = multer({ storage: storage });
const fs = require("fs");
const Account = require("../model/Account");
const FullName = require("../model/FullName");
const { format } = require("../module/mysql-connector");
route.post("/login", (req, res) => {
  let { username, password, socketId } = req.body;
  let query = `SELECT * FROM account, fullname WHERE username = '${
    username || ""
  }' AND password = '${password || ""}' AND fullNameId = fullname.id`;
  connection.query(query, (err, result, fields) => {
    if (err) throw err;
    if (result.length != 0) {
      let {
        username,
        password,
        id,
        fullNameId,
        firstName,
        middleName,
        lastName,
        avtUrl,
      } = result[0];
      let account = Account(username, password, id, fullNameId, avtUrl);
      account.fullName = FullName(firstName, middleName, lastName, fullNameId);
      let token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET);
      connection.query(
        `UPDATE account SET sessionSocket = '${socketId}' WHERE account.id = ${account.id}`
      );
      res.json({ ...account, token });
    } else {
      res.json({ username, password });
    }
  });
});
route.get("/list-conversations", (req, res) => {
  let filter = {
    limit: parseInt(req.query["limit"]) || 10,
    page: parseInt(req.query["page"]) || 1,
  };
  let token = req.headers["authorization"];
  token = token.split(" ")[1];
  if (token === null) return res.sendStatus(403);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    if (err) return res.sendStatus(403);
    let conversations = {};
    let order = [];
    let getPaticipantsQuery = `	SELECT * FROM ( SELECT DISTINCT sortedConversation.conversationId, sortedConversation.created FROM (SELECT ROW_NUMBER() OVER ( partition by conversationId ORDER BY created DESC ) as rowNumber , created,  conversationId FROM message ) AS sortedConversation, (SELECT conversations.conversationId FROM message, (SELECT conversationId, isRead, accountId FROM conversation_paticipants WHERE conversation_paticipants.accountId = ${result.id}) AS conversations WHERE message.conversationId = conversations.conversationId) AS joinedConversation WHERE sortedConversation.conversationId = joinedConversation.conversationId AND sortedConversation.rowNumber = 1 ORDER BY sortedConversation.created DESC ) AS conversation, account, fullname, conversation_paticipants WHERE conversation.conversationId = conversation_paticipants.conversationId AND conversation_paticipants.accountId = account.id AND account.fullNameId = fullname.id ORDER BY conversation.created DESC`;
    connection.query(getPaticipantsQuery, (err, data) => {
      if (err) throw err;
      for (let row of data) {
        if (!conversations[row.conversationId]) {
          conversations[row.conversationId] = {
            conversationId: row.conversationId,
            messages: [],
            participants: {},
            filter,
            multimediaInfo: {
              image: {
                size: 0,
                quantity: 0,
              },
              document: {
                size: 0,
                quantity: 0,
              },
              attachment: {
                size: 0,
                quantity: 0,
              },
              video: {
                size: 0,
                quantity: 0,
              },
            },
            isRead: row.accountId === result.id ? row.isRead : null,
          };
        }
        if (order.indexOf(row.conversationId) === -1) {
          order.push(row.conversationId);
        }
        if (!conversations[row.conversationId].participants[row.accountId])
          conversations[row.conversationId].participants[row.accountId] = {
            id: row.accountId,
            username: row.username,
            fullNameId: row.fullNameId,
            fullName: {
              middleName: row.middleName,
              lastName: row.lastName,
              firstName: row.firstName,
            },
            sessionSocket: row.sessionSocket,
            avtUrl: row.avtUrl,
          };
      }
      for (let id in conversations) {
        conversations[id].chatTitle = Object.values(
          conversations[id].participants
        )
          .map((p) =>
            p.id !== result.id
              ? `${p.fullName.firstName} ${p.fullName.middleName} ${p.fullName.lastName}`
              : ""
          )
          .filter((t) => t)
          .join(", ");
      }
    });
    let getMessages = `
    SELECT T.id, T.accountId, T.content, T.created, T.conversationId , T.isImage
	FROM (SELECT ROW_NUMBER() OVER (PARTITION BY conversationId ORDER BY created) AS rowNumber,isImage, accountId, content, created, id , conversationId 
			FROM message) AS T, conversation_paticipants 
	WHERE rowNumber > ${(filter.page - 1) * filter.limit} 
		AND T.rowNumber < ${filter.page * filter.limit} 
        AND conversation_paticipants.accountId = ${result.id} 
        AND conversation_paticipants.conversationId = T.conversationId`;
    connection.query(getMessages, (err, data) => {
      if (err) throw err;
      for (let line of data) {
        if (conversations[line.conversationId]?.messages)
          conversations[line.conversationId].messages.push({
            id: line.id,
            content: line.content,
            created: line.created,
            accountId: line.accountId,
            isImage: Boolean(line.isImage),
          });
      }
      if (order.length > 0) {
        let changeIsRead = `UPDATE conversation_paticipants SET isRead = 1 WHERE conversationId = ${order[0]} AND accountId = ${result.id}`;
        connection.query(changeIsRead, (err, data) => {
          if (err) throw err;
          conversations[order[0]].isRead = true;
        });
      }
      for (let key in conversations) {
        if (conversations[key].messages.length < filter.limit)
          conversations[key].filter = { ...filter, canLoadMore: false };
        else conversations[key].filter = { ...filter, canLoadMore: true };
      }
      let multimediaQuery = `SELECT message.content, message.conversationId 
    FROM conversation_paticipants, message 
    WHERE conversation_paticipants.accountId = ${result.id} 
      AND message.conversationId = conversation_paticipants.conversationId 
      AND message.isImage = 1`;
      connection.query(multimediaQuery, (err, data, fields) => {
        if (err) throw err;
        for (let row of data) {
          let filename = row.content;
          try {
            let size = fs.statSync(uploadPath + filename).size / (1024 * 1024);
            if (size > 0) {
              conversations[
                row.conversationId
              ].multimediaInfo.image.quantity += 1;
              conversations[row.conversationId].multimediaInfo.image.size +=
                size;
            }
          } catch (error) {}
        }
        res.json({ conversations, order });
      });
    });
  });
  route.post("/upload-image", upload.single("image"), (req, res) => {
    let token = req.headers["authorization"].split(" ")[0];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) res.sendStatus(403);
      res.json(req.file);
    });
  });
  route.get("/search-user", (req, res) => {
    let token = req.headers["authorization"].split(" ")[1];
    let { query, id } = req.query;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) throw err;
      let queryString = `SELECT account.id, username, firstName ,middleName, lastName, sessionSocket, avtUrl FROM account, fullname WHERE fullname.id = fullNameId AND account.id != ${result.id} AND (firstName LIKE "%${query}%" OR middleName LIKE "%${query}%" OR lastName LIKE "%${query}%" OR username LIKE "%${query}%")`;
      connection.query(queryString, (err, result) => {
        if (err) throw err;
        let resData = [];
        for (let user of result) {
          let tmp = {
            id: user.id,
            username: user.username,
            fullName: {
              firstName: user.firstName,
              middleName: user.middleName,
              lastName: user.lastName,
            },
            avtUrl: user.avtUrl,
            sessionSocket: user.sessionSocket,
          };
          resData.push(tmp);
        }
        res.json(resData);
      });
    });
  });
  route.post("/update-name", (req, res) => {
    let { token, newName } = req.body;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        res.sendStatus(403);
        throw err;
      }
      let nameArr = newName.split(" ").filter((t) => t);
      let fullName = {
        firstName: nameArr[0],
        lastName: nameArr[nameArr.length - 1],
        middleName: nameArr.slice(1, nameArr.length - 1).join(" "),
      };
      let updateQuery = `UPDATE fullname SET firstName ="${fullName.firstName}", middleName = "${fullName.middleName}", lastName="${fullName.lastName}" WHERE id = ${user.fullNameId}`;
      connection.query(updateQuery, (err, responsive, fields) => {
        if (err) throw err;
        res.json(fullName);
      });
    });
  });
  route.get("/conversation-multimedia-information", (req, res) => {
    let token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) res.sendStatus(403);

      res.json(formatedData);
    });
  });
});
module.exports = route;
