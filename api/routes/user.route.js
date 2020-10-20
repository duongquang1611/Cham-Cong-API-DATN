import express from "express";
import handleError from "../../commons/handleError.js";
import auth from "../../middleware/auth.middleware.js";
import userModel from "../../models/user.model.js";
import controller from "../controllers/user.controller.js";

var router = express.Router();
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

// all user
router.get("/", auth, controller.index);

router.get("/:id", auth, controller.detailUser);

// delete user
router.delete("/:id", auth, controller.deleteUser);

export default router;
