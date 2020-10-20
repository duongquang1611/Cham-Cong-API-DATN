import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

const index = async (req, res, next) => {
  userModel
    .find({}, "-__v")
    .populate({
      path: "roleId",
      select: "-__v",
    })
    .sort({ updatedAt: -1 }) // new to old
    .select("-password")
    .then((items) => res.json(items));
};

const detailUser = async (req, res, next) => {
  console.log("req.params.id", req.params.id);
  try {
    let user = await userModel
      .findOne({ _id: req.params.id }, "-password -__v")
      .populate({
        path: "roleId",
        select: "-__v",
      })
      .select("-password");

    if (!user) {
      return handleError(res, "User không tồn tại.");
    }
    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteUser = async (req, res, next) => {
  userModel
    .findById(req.params.id)
    .then((item) => {
      return item
        .remove()
        .then(() =>
          res.json({ msg: `Xóa userId: ${req.params.id} thành công` })
        );
    })
    .catch((err) => {
      return res
        .status(404)
        .json({ msg: `userId: ${req.params.id} không tồn tại.` });
    });
};

export default {
  index,
  detailUser,
  deleteUser,
};
