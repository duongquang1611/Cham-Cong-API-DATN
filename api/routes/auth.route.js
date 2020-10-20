import express from "express";

import userModel from "../../models/user.model.js";
import config from "../../config/index.js";
import handleError from "../../commons/handleError.js";
import controller from "../controllers/auth.controller.js";
var router = express.Router();

router.post("/signin", controller.postSignIn);

router.post("/signup", controller.postSignUp);

export default router;
