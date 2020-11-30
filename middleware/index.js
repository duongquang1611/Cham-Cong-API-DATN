import auth from "./auth.middleware.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import handleError from "../commons/handleError.js";
import config from "../config/index.js";

const checkObjectId = (req, res, next) => {
  let _id = req.params.id;
  if (!mongoose.isValidObjectId(_id)) {
    console.log("middleware");
    return handleError(res, `Id: ${_id} không tồn tại.`);
  }
  next();
};

const isAdminSystem = (req, res, next) => {
  if (req.user.role === "admin_system") {
    next();
  } else {
    return handleError(res, "Bạn không có quyền truy cập chức năng này.");
  }
};
const isDirector = (req, res, next) => {
  if (req.user.role === "director") {
    next();
  } else {
    return handleError(res, "Bạn không có quyền truy cập chức năng này.");
  }
};
const isAdminCompany = (req, res, next) => {
  if (req.user.role === "admin_company") {
    next();
  } else {
    return handleError(res, "Bạn không có quyền truy cập chức năng này.");
  }
};
const isManager = (req, res, next) => {
  if (req.user.role === "manager") {
    next();
  } else {
    return handleError(res, "Bạn không có quyền truy cập chức năng này.");
  }
};
const isStaff = (req, res, next) => {
  if (req.user.role === "staff") {
    next();
  } else {
    return handleError(res, "Bạn không có quyền truy cập chức năng này.");
  }
};

export default {
  auth,
  checkObjectId,
  isAdminSystem,
  isAdminCompany,
  isDirector,
  isManager,
  isStaff,
};
