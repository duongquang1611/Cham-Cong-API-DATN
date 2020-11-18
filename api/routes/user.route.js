import express from "express";
import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import controller from "../controllers/user.controller.js";
import middleware from "../../middleware/index.js";
var router = express.Router();
import { multerSingle } from "../handlers/multer.upload.js";

const { auth, checkObjectId, isAdminSystem } = middleware;
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];
// all user
router.get("/", auth, controller.index);

// detail user
router.get("/:id", [auth, checkObjectId], controller.detailUser);

// delete user
router.delete("/:id", [auth, checkObjectId], controller.deleteUser);

// update user
// router.put("/:id", [auth, checkObjectId], controller.updateUser);

router.put(
  "/:id",
  [auth, checkObjectId, multerSingle.single("file")],
  controller.updateUser
);

export default router;
