import dotenv from "dotenv";
dotenv.config();

// console.log(dotenv);
export default {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
};

//db postgres
// postgres://cseloklplqzkpp:a49e44f0fb4df68f775eecc7507ebe72d1d60d521baf4cb1970d8bebb05aa73f@ec2-50-17-197-184.compute-1.amazonaws.com:5432/d441ok1jpao8hu
