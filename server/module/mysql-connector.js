const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  database: "chat-app",
  user: "root",
  password: "19021999",
});
connection.connect();

module.exports = connection;
