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
router.put(
  "/ask-come-leave",
  [auth, checkObjectId],
  controller.putAskComeLeave
);

// search list checkin has as come leave
router.get("/ask-come-leave", auth, controller.getAskComeLeave);

// search list day off
router.get("/day-off", auth, controller.getAskDayOff);

// create or update day - off
router.put("/day-off", auth, controller.putAskDayOff);

//create data fake
router.post("/fake", controller.fakeWorkDay);

// detail 1 checkin
router.get("/:id", [auth, checkObjectId], controller.getDetailWorkDay);

export default router;
