import express from "express";
import middleware from "../../middleware/index.js";
import controller from "../controllers/upload.controller.js";
import { multerSingle } from "../handlers/multer.upload.js";
var router = express.Router();

const { auth, checkObjectId, isAdminSystem } = middleware;

router.post("/", [multerSingle.single("file")], controller.postUploadImage);

export default router;
