import express from "express";
import mongoose from "mongoose";
import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import auth from "../../middleware/auth.middleware.js";
import companyModel from "../../models/company.model.js";
import controller from "../controllers/company.controller.js";
var router = express.Router();

router.get("/", controller.index);

router.post("/", auth, controller.postIndex);

export default router;
