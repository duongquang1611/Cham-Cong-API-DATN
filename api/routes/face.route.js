import express from "express";
import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import controller from "../controllers/face.controller.js";
import middleware from "../../middleware/index.js";
var router = express.Router();
import { multerSingle } from "../handlers/multer.upload.js";

const { auth, checkObjectId, isAdminSystem } = middleware;
const listKey = ["username", "password", "name", "roleId"];

// create person for user
router.post(
  "/create-person/:id",
  [auth, checkObjectId],
  controller.createPerson
);

// create person group for company
router.put(
  "/create-person-group/:id",
  [auth, checkObjectId],
  controller.createPersonGroup
);

// router.put(
//   "/:id",
//   [auth, checkObjectId, multerSingle.single("file")],
//   controller.updateUser
// );

export default router;
