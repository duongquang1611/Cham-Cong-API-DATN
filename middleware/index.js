import auth from "./auth.middleware.js";
import mongoose from "mongoose";
import handleError from "../commons/handleError.js";

const checkObjectId = (req, res, next) => {
  let _id = req.params.id;
  if (!mongoose.isValidObjectId(_id)) {
    return handleError(res, `Id: ${_id} không tồn tại.`);
  }
  next();
};

export default { auth, checkObjectId };
