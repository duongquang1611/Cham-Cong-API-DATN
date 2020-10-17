import dotenv from "dotenv";
dotenv.config();

// console.log(dotenv);
export default {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
};
