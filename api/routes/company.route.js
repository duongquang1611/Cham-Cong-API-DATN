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

// get config default
router.get("/config/default", controller.getConfigCompanyDefault);

// search list checkin company
router.get("/work-day", auth, controller.getListWorkDayCompany);

// search list ask come leave in company
router.get("/ask-come-leave", auth, controller.getListAskComeLeaveInCompany);

router.get("/ask-day-off", auth, controller.getListAskDayOffInCompany);

router.get("/users", [auth], controller.getUserCompany);

// user in company
router.get("/:id/users", [auth, checkObjectId], controller.getUserCompany);

// search list checkin company
router.get(
  "/:id/work-day",
  [auth, checkObjectId],
  controller.getListWorkDayCompany
);

// search list ask come leave in company
router.get(
  "/:id/ask-come-leave",
  [auth, checkObjectId],
  controller.getListAskComeLeaveInCompany
);
// search list ask come leave in company
router.post(
  "/:id/create-person-group",
  [auth, checkObjectId],
  controller.createPersonGroup
);

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
