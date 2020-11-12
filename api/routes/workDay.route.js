import express from "express";
import handleError from "../../commons/handleError.js";
import controller from "../controllers/workDay.controller.js";
import middleware from "../../middleware/index.js";

var router = express.Router();
const { auth, checkObjectId, isAdminSystem } = middleware;
// search list checkin
router.get("/", auth, controller.index);

// create and update work day
router.put("/", [auth, checkObjectId], controller.updateWorkDay);

// create and update work day with come leave
router.put("/ask-come-leave", [auth, checkObjectId], controller.askComeLeave);

// search list checkin company
router.get(
  "/company/:id",
  [auth, checkObjectId],
  controller.getListWorkDayCompany
);

// detail 1 checkin
router.get("/:id", [auth, checkObjectId], controller.getDetailWorkDay);

export default router;
