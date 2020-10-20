import express from "express";
import roleModel from "../../models/role.model.js";
import userModel from "../../models/user.model.js";
import controller from "../controllers/role.controller.js";
var router = express.Router();

router.get("/", controller.index);

export default router;
