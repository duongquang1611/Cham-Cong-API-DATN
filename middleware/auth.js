import jwt from "jsonwebtoken";
import config from "../config/index.js";

const { JWT_SECRET } = config;

const auth = (req, res, next) => {
  const authorization = req.header("Authorization");

  // Check for token
  if (!authorization)
    return res
      .status(401)
      .json({ msg: "Bạn phải đăng nhập để thực hiện chức năng này." });

  const tokenArray = authorization.split(" ");
  const token = tokenArray[1];
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Add user from payload
    req.user = decoded;
    next();
  } catch (e) {
    throw Error("Token không hợp lệ.");
    // res.status(400).json({ msg: "Token không hợp lệ." });
  }
};
export default auth;
