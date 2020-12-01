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
import companyModel from "../../models/company.model.js";
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
    crop: "scale",
    format: "jpg",
  });
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

const createPersonGroup = async (req, res, next) => {
  console.log("createPersonGroup");
  try {
    let id = req.params.id;
    let company = await companyModel.findById(id);
    let createPersonGroup = await resources.createPersonGroup(
      company._id,
      company.name
    );
    if (createPersonGroup.status === 200) {
      let updateData = {
        havePersonGroup: true,
      };
      let newCompany = await companyModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return res.status(200).json(newCompany);
    } else {
      return handleError(res);
    }
  } catch (error) {
    console.log("createPersonGroup ~ error", error);
    return handleError(res, error.message);
  }
};

export default {
  createPerson,
  createPersonGroup,
};
