var dotenv = require("dotenv");
dotenv.config();

// console.log(dotenv);
module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
};
