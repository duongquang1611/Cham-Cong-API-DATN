import express from "express";
import mongoose from "mongoose";
import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import auth from "../../middleware/auth.middleware.js";
import companyModel from "../../models/company.model.js";
import controller from "../controllers/company.controller.js";
import middleware from "../../middleware/index.js";

var router = express.Router();

// all company
router.get("/", controller.index);

// create company
router.post("/", auth, controller.postIndex);

// detail company
router.get(
  "/:id",
  [middleware.auth, middleware.checkObjectId],
  controller.detailCompany
);

// delete company
router.delete(
  "/:id",
  [middleware.auth, middleware.checkObjectId],
  controller.deleteCompany
);

// update commpany
router.put(
  "/:id",
  [middleware.auth, middleware.checkObjectId],
  controller.updateCompany
);

// setup location
// router.put

export default router;
