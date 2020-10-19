import express from "express";
import roleModel from "../../models/role.model.js";
import userModel from "../../models/user.model.js";

var router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let roles = await roleModel.find({}, "-__v");
    res.json(roles);
  } catch (error) {
    res.status(400).json({ msg: error });
  }
});

router.get("/test", async (req, res, next) => {
  try {
    let test = await userModel
      .find({}, "-__v")
      .populate({ path: "roleId", select: "-__v" });
    res.json(test);
  } catch (error) {
    res.status(400).json({ msg: error });
  }
});
export default router;
