import express from "express";
import mongoose from "mongoose";
import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import companyModel from "../../models/company.model.js";
import controller from "../controllers/company.controller.js";
import middleware from "../../middleware/index.js";

var router = express.Router();
const { auth, checkObjectId, isAdminSystem } = middleware;

// all company
router.get("/", controller.index);

// create company
router.post("/", [auth, isAdminSystem], controller.postIndex);

// setup info to checkin
router.put("/config", [auth, checkObjectId], controller.configCompany);

// detail company
router.get("/:id", [auth, checkObjectId], controller.detailCompany);

// delete company
router.delete(
  "/:id",
  [auth, checkObjectId, isAdminSystem],
  controller.deleteCompany
);

// update commpany
router.put("/:id", [auth, checkObjectId], controller.updateCompany);

export default router;
