import { createConnection } from "mysql";
import "dotenv/config";

var conn = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

export default conn;
