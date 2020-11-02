import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import mongoose from "mongoose";
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

const index = async (req, res, next) => {
  userModel
    .find({}, "-__v")
    .populate({
      path: "roleId",
      select: "-__v",
    })
    .populate({
      path: "companyId",
      select: "-__v",
    })
    .sort({ updatedAt: -1 }) // new to old
    .select("-password")
    .then((items) => res.status(200).json(items));
};

const detailUser = async (req, res, next) => {
  try {
    let user = await userModel
      .findOne({ _id: req.params.id }, "-password -__v")
      .populate({
        path: "roleId",
        select: "-__v",
      })
      .populate({
        path: "companyId",
        select: "-__v",
      })
      .populate({
        path: "parentId",
        select: "-__v -password",
      })
      .select("-password")
      .exec();

    if (!user) {
      return handleError(res, "User không tồn tại.");
    }
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteUser = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let user = await userModel.findOneAndRemove({ _id });
    if (!user) {
      return handleError(res, `Id: ${_id} không tồn tại.`);
    }
    return res
      .status(200)
      .json({ msg: `Xóa Id: ${req.params.id} thành công.` });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateUser = async (req, res, next) => {
  let _id = req.params.id;
  let updateData = req.body;
  try {
    // cach 1
    let newUser = await userModel
      .findByIdAndUpdate(_id, updateData, { new: true })
      .populate({
        path: "companyId",
        select: "-__v",
      })
      .populate({
        path: "roleId",
        select: "-__v",
      })
      .select("-__v -password")
      .exec();

    // cach 2
    // let newUser = await userModel
    //   .findOneAndUpdate({ _id }, updateData, { new: true })
    //   .select("-__v -password")
    //   .exec();
    if (!newUser) {
      return handleError(res, "Cập nhật thông tin không thành công.");
    }
    return res.status(200).json(newUser);
  } catch (error) {
    return handleError(res, error);
  }
};

export default {
  index,
  detailUser,
  deleteUser,
  updateUser,
};
