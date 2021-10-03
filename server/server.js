const express = require("express");
const app = express();
const fs = require("fs");
const http = require("http");
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
const io = require("socket.io")(server, {
  cors: {
    origin: ["*"],
  },
});
const webpackConfig = require("../webpack.config");
const webpack = require("webpack");
const middleware = require("webpack-dev-middleware");
const compiler = webpack({
  ...webpackConfig,
});
const AccountRouter = require("./route/account.route");
const connection = require("./module/mysql-connector");
var bodyParser = require("body-parser");
app.use(middleware(compiler));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
app.use(express.static("public"));
app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use("/", AccountRouter);
io.on("connection", (socket) => {
  socket.on("online", (userId) => {
    socket.broadcast.emit("online", userId, socket.id);
  });
  socket.on("join-rooms", (conversationIds) => {
    let rooms = [...conversationIds].map((id) => `Room ${id}`);
    socket.join(rooms);
  });
  socket.on("store-socketid", (token) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) throw err;
      let query = `UPDATE account SET sessionSocket = '${socket.id}' WHERE id = ${result.id}`;
      connection.query(query, (err, data, fields) => {
        if (err) throw err;
      });
    });
  });
  socket.on("send-message", (token, conversationId, mess, imageUrl) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) throw err;
      let newMessage = {
        created: new Date().toISOString().slice(0, 19).replace("T", " "),
        accountId: result.id,
      };
      if (imageUrl) {
        newMessage.isImage = true;
        newMessage.content = imageUrl;
      } else {
        newMessage.isImage = false;
        newMessage.content = mess;
      }
      let getAllOfflinePeople = `SELECT account.id,conversation_paticipants.conversationId  FROM account, conversation_paticipants WHERE isNull(account.sessionSocket) AND conversation_paticipants.conversationId = ${conversationId} AND account.id = conversation_paticipants.accountId AND conversation_paticipants.isRead = 1`;
      connection.query(getAllOfflinePeople, (err, responsive, fields) => {
        if (err) throw err;
        let updateAllOfflinePeople = "";
        for (let row of responsive) {
          let tmp = `UPDATE conversation_paticipants SET isRead = 0 WHERE accountId = ${row.id} AND conversationId = ${row.conversationId}`;
          updateAllOfflinePeople += tmp;
        }
        if (updateAllOfflinePeople) {
          connection.query(updateAllOfflinePeople, (err, res) => {
            if (err) throw err;
          });
        }
      });
      let query = `INSERT INTO message(content, created, conversationId, accountId, isImage) VALUES ("${newMessage.content}", "${newMessage.created}" , ${conversationId}, ${newMessage.accountId}, ${newMessage.isImage})`;
      connection.query(query, (err, data, fields) => {
        if (err) throw err;
        newMessage.id = data.insertId;
      });
      socket
        .to(`Room ${conversationId}`)
        .emit("receive-message", newMessage, conversationId);
    });
  });
  socket.on("change-avatar", (filename, token) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) res.sendStatus(403);
      let id = result.id;
      let avtUrlQuery = `SELECT avtUrl FROM account WHERE id = ${id}`;
      connection.query(avtUrlQuery, (err, data, fields) => {
        if (err) throw err;
        if (data.length === 0) return;
        let avtUrl = data[0].avtUrl;
        fs.unlink("./public/uploads/" + avtUrl, () => {});
      });
      let query = `UPDATE account SET avtUrl = '${filename}' WHERE id = ${id}`;
      connection.query(query, (err) => {
        if (err) throw err;
        socket.broadcast.emit("change-avatar", id, filename);
      });
    });
  });
  socket.on("seen", (token, conversationId) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) throw err;
      let query = `UPDATE conversation_paticipants SET isRead = 1 WHERE accountId = ${user.id} AND conversationId = ${conversationId}`;
      connection.query(query, (err, responsive, fields) => {
        if (err) throw err;
      });
    });
  });
  socket.on("create-conversation", (token, otherUserId) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) throw err;
      //Create conversation;
      let query = `INSERT INTO conversation(created) VALUES ('${new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}')`;
      connection.query(query, (err, data, fields) => {
        if (err) throw err;
        let conversationId = data.insertId;
        if (!conversationId) return;
        let addParticipants1 = `INSERT INTO conversation_paticipants(accountId, conversationId) VALUES (${result.id}, ${conversationId});`;
        let addParticipants2 = `INSERT INTO conversation_paticipants(accountId, conversationId) VALUES (${otherUserId}, ${conversationId});`;
        connection.query(addParticipants1, (err, data, fields) => {
          if (err) throw err;
        });
        connection.query(addParticipants2, (err, data, fields) => {
          if (err) throw err;
        });
        let initMessageObject = {
          content: "INIT",
          created: new Date().toISOString().slice(0, 19).replace("T", " "),
          accountId: result.id,
          conversationId,
        };
        let initMessage = `INSERT INTO message(content, created, conversationId, accountId, isImage) VALUES ('${initMessageObject.content}', '${initMessageObject.created}', ${initMessageObject.conversationId}, ${initMessageObject.accountId}, 0);`;
        connection.query(initMessage);
        let getConversationData = `SELECT DISTINCT * FROM account, fullname WHERE (account.id = ${result.id} OR account.id = ${otherUserId}) AND fullname.id = account.fullNameId;`;
        connection.query(getConversationData, (err, data) => {
          if (err) throw err;
          let formatedData = {
            messages: [initMessageObject],
            conversationId,
            participants: {},
            filter: {
              limit: 10,
              page: 1,
              canLoadMore: true,
            },
          };
          for (let row of data) {
            formatedData.participants[row.id] = {
              id: row.id,
              fullName: {
                firstName: row.firstName,
                middleName: row.middleName,
                lastName: row.lastName,
              },
              username: row.username,
              sessionSocket: row.sessionSocket,
              avtUrl: row.avtUrl,
            };
          }
          let chatTitle = "";
          formatedData.createdBy = result.id;
          for (let user of Object.values(formatedData.participants)) {
            chatTitle = Object.values(formatedData.participants)
              .map((u) =>
                u.id !== user.id
                  ? `${u.fullName.firstName} ${u.fullName.middleName} ${u.fullName.lastName}`
                  : ""
              )
              .filter((t) => t)
              .join(", ");

            formatedData.chatTitle = chatTitle;
            user.sessionSocket &&
              io
                .to(user.sessionSocket)
                .emit("create-conversation-success", formatedData);
          }
        });
      });
    });
  });
  socket.on("typing", (sessionSocket) => {
    io.to(sessionSocket).emit("typing");
  });
  socket.on("untyping", (sessionSocket) => {
    io.to(sessionSocket).emit("untyping");
  });
  socket.on("change-isRead-conversation", (token, conversationId, isRead) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) throw err;
      let changeIsReadConversationQuery = `UPDATE conversation_paticipants SET isRead = ${isRead} WHERE (accountId = ${user.id}) and (conversationId = ${conversationId});`;
      connection.query(changeIsReadConversationQuery, (err, data, fields) => {
        if (err) throw err;
      });
    });
  });
  socket.on("disconnect", () => {
    let getOnline = `SELECT id FROM account WHERE sessionSocket = '${socket.id}'`;
    connection.query(getOnline, (err, data, fields) => {
      if (err) throw err;
      if (data.length === 0) return;
      socket.broadcast.emit("offline", data[0].id);
    });
    let query = `UPDATE account SET sessionSocket = null WHERE sessionSocket = '${socket.id}'`;
    connection.query(query);
  });
});
server.listen(port, () => {
  console.log("Listening on " + port + "...");
});
