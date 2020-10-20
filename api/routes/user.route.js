import express from "express";
import handleError from "../../commons/handleError.js";
import auth from "../../middleware/auth.middleware.js";
import userModel from "../../models/user.model.js";
import controller from "../controllers/user.controller.js";
import middleware from "../../middleware/index.js";
var router = express.Router();
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

// all user
router.get("/", auth, controller.index);

// detail user
router.get(
  "/:id",
  [middleware.auth, middleware.checkObjectId],
  controller.detailUser
);

// delete user
router.delete(
  "/:id",
  [middleware.auth, middleware.checkObjectId],
  controller.deleteUser
);

// update user
router.put(
  "/:id",
  [middleware.auth, middleware.checkObjectId],
  controller.updateUser
);

export default router;
