const mysql2 = require("mysql2");
const dotenv = require("dotenv");
const logger = require("../logger");
dotenv.config();

const connection = mysql2.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect(error => {
  if (error) return logger.error(error);
  logger.info("db connection successfull");
});

module.exports = connection;
