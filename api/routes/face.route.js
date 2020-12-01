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
  "/:id/create-person",
  [auth, checkObjectId],
  controller.createPerson
);

// add face
router.post(
  "/:id/add-face",
  [auth, checkObjectId, multerSingle.single("file")],
  controller.addFace
);

// create person group for company
router.put(
  "/:id/create-person-group",
  [auth, checkObjectId],
  controller.createPersonGroup
);

// train person group for company
router.post("/:id/train", [auth, checkObjectId], controller.trainGroup);

// list person group in company
router.get("/:id/persons", [auth, checkObjectId], controller.listPersons);

export default router;
