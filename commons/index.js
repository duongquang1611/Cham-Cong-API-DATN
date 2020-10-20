import handleError from "./handleError.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import mongoose from "mongoose";

const getUserIdInToken = (req) => {
  const authorization = req.header("Authorization");
  const tokenArray = authorization.split(" ");
  const token = tokenArray[1];
  const decodedToken = jwt.verify(token, config.JWT_SECRET);
  return decodedToken;
};

const commons = {
  handleError,
  getUserIdInToken,
};

export default commons;
