import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import mongoose from "mongoose";
const listKey = ["username", "password", "name", "roleId"];
import cloudinary from "cloudinary";
import { multerSingle } from "../handlers/multer.upload.js";
import commons from "../../commons/index.js";
import resources from "../resources/index.js";
const { Types } = mongoose;

let SORT_TIME_UPDATED_DESC = { updatedAt: -1 };
let SORT_DAY_WORK = { dayWork: -1 };

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const resizeImage = (id, h, w) => {
  return cloudinary.url(id, {
    height: h,
    width: w,
    crop: "fit",
    format: "jpg",
  });
};
const urlResize = (imageData) => {
  return {
    thumb200: resizeImage(imageData.public_id, 200, 200),
    thumb300: resizeImage(imageData.public_id, 300, 300),
    thumb500: resizeImage(imageData.public_id, 500, 500),
    original: imageData.secure_url,
  };
};
// search all user
const index = async (req, res, next) => {
  try {
    let users = [];
    // const { name = "", companyId, username = "", text } = req.query;
    // console.log(" req.query", req.query);

    // if (companyId) {
    //   users = await userModel
    //     .find(
    //       {
    //         companyId: companyId,
    //         name: { $regex: name, $options: "$i" },
    //         username: { $regex: username, $options: "$i" },
    //       },
    //       "-__v"
    //     )
    //     .populate({
    //       path: "roleId",
    //       select: "-__v",
    //     })
    //     .populate({
    //       path: "companyId",
    //       select: "-__v",
    //     })
    //     .populate({
    //       path: "parentId",
    //       select: "-__v -password",
    //     })
    //     .sort({ updatedAt: -1 }) // new to old
    //     .select("-password");
    // } else {
    //   users = await userModel
    //     .find(
    //       {
    //         name: { $regex: name, $options: "$i" },
    //         username: { $regex: username, $options: "$i" },
    //       },
    //       "-__v"
    //     )
    //     .populate({
    //       path: "roleId",
    //       select: "-__v",
    //     })
    //     .populate({
    //       path: "companyId",
    //       select: "-__v",
    //     })
    //     .sort({ updatedAt: -1 }) // new to old
    //     .select("-password");
    // }

    // console.log("users", users.length);
    let {
      page = 0,
      size = 10000,
      userId,
      companyId,
      parentId,
      text,
      // name = "",
      // username = "",
      sortType,
      sortValue,
      ...otherSearch
    } = req.query;

    let sort = {};
    if (sortType) {
      sort[sortType] = parseInt(sortValue);
    } else {
      sort = SORT_TIME_UPDATED_DESC;
    }
    let search = {};

    if (text && text.trim().length !== 0) {
      search = {
        ...search,
        $text: { $search: text.trim() },
      };
    }
    if (userId) {
      search.userId = Types.ObjectId(userId);
    }
    if (parentId) {
      search.parentId = Types.ObjectId(parentId);
    }
    if (companyId) {
      search.companyId = Types.ObjectId(companyId);
    }

    Object.entries(otherSearch).map(([key, value]) => {
      if (value == "true") search[key] = true;
      else if (value == "false") search[key] = false;
      else if (commons.isNumeric(value)) search[key] = parseFloat(value);
      else search[key] = { $regex: new RegExp(value), $options: "$i" };
    });

    console.log("user.controller.js ~ index ~ search", search);

    users = await userModel.aggregate([
      {
        $match: search,
      },

      commons.lookUp("roleId", "roles", "_id", "roleId"),
      { $unwind: { path: "$roleId", preserveNullAndEmptyArrays: true } },

      commons.lookUp("companyId", "companies", "_id", "companyId"),
      { $unwind: { path: "$companyId", preserveNullAndEmptyArrays: true } },

      commons.lookUp("parentId", "users", "_id", "parentId"),
      { $unwind: { path: "$parentId", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          // select field to show, hide
          "parentId.password": 0,
          "roleId.__v": 0,
          "parentId.__v": 0,
          "companyId.__v": 0,
          password: 0,
          __v: 0,
        },
      },
      {
        $sort: sort,
      },
      ...commons.getPageSize(page, size),

      // commons.groupBy(),
    ]);
    console.log("users", users.length);
    return res.status(200).json(users);
  } catch (error) {
    return handleError(res, error.message);
  }
};

const detailUser = async (req, res, next) => {
  console.log("detailUser");
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
  console.log("deleteUser");

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
      // console.log({ result });
      resize = urlResize(result);
      console.log({ resize });
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

const createPerson = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let user = await userModel.findById(_id);
    if (user.personId) {
      console.log("Đã có personId rồi", user.personId);
      return res.status(200).json(user);
    }
    let createPerson = await resources.createPerson(
      user.companyId,
      user._id,
      user.name
    );
    if (createPerson.status === 200) {
      console.log("create person success");
      let updateData = {
        personId: createPerson?.data?.personId,
      };

      let newUser = await userModel.findByIdAndUpdate(_id, updateData, {
        new: true,
      });
      return res.status(200).json(newUser);
    } else {
      return handleError(res, error.message);
    }
  } catch (error) {
    return handleError(res, error.message);
  }
};

export default {
  index,
  detailUser,
  deleteUser,
  updateUser,
  createPerson,
};
