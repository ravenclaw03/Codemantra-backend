import "dotenv/config";
import mysql from "mysql"
const sqlPwd = process.env.PASSWORD;
export const db = mysql.createConnection({
  host: "sql6.freesqldatabase.com",
  user: "sql6697854",
  password: sqlPwd,
  database: "sql6697854",
  port: 3306,
});
