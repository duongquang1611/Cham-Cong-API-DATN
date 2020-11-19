import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import mongoose from "mongoose";
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];
import cloudinary from "cloudinary";
import { multerSingle } from "../handlers/multer.upload.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const resizeImage = (id, h, w) => {
  return cloudinary.url(id, {
    height: h,
    width: w,
    crop: "scale",
    format: "jpg",
  });
};

// search all user
const index = async (req, res, next) => {
  try {
    const { name = "", companyId, username = "" } = req.query;
    console.log(" req.query", req.query);
    let users = [];

    if (companyId) {
      users = await userModel
        .find(
          {
            companyId: companyId,
            name: { $regex: name, $options: "$i" },
            username: { $regex: username, $options: "$i" },
          },
          "-__v"
        )
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
        .sort({ updatedAt: -1 }) // new to old
        .select("-password");
    } else {
      users = await userModel
        .find(
          {
            name: { $regex: name, $options: "$i" },
            username: { $regex: username, $options: "$i" },
          },
          "-__v"
        )
        .populate({
          path: "roleId",
          select: "-__v",
        })
        .populate({
          path: "companyId",
          select: "-__v",
        })
        .sort({ updatedAt: -1 }) // new to old
        .select("-password");
    }

    console.log("users", users.length);
    return res.status(200).json(users);
  } catch (error) {
    return handleError(res, error.message);
  }
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
    return handleError(res, error.message);
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
    return handleError(res, error.message);
  }
};

const updateUser = async (req, res, next) => {
  try {
    let _id = req.params.id;
    let resize = null;
    if (req.file && req.file.path) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      resize = {
        thumb200: resizeImage(result.public_id, 200, 200),
        thumb300: resizeImage(result.public_id, 300, 300),
        thumb500: resizeImage(result.public_id, 500, 500),
        original: result.secure_url,
      };
    }
    let updateData = { ...req.body };
    if (resize) {
      updateData.avatar = resize;
    }
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
      .populate({
        path: "parentId",
        select: "-__v -password",
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
    console.log("error", error);
    return handleError(res, error.message);
  }
};
export default {
  index,
  detailUser,
  deleteUser,
  updateUser,
};
