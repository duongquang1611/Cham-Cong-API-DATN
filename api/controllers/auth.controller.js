import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import roleModel from "../../models/role.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import mongoose from "mongoose";
import resources from "../resources/index.js";
const { Types } = mongoose;
const listKey = ["username", "password", "name", "roleId"];

const postSignIn = async (req, res, next) => {
  console.log("postSignIn");
  const { username, password } = req.body;

  try {
    let user = await userModel
      .findOne({ username })
      .select("-__v")
      .populate({ path: "roleId" })
      .populate({ path: "companyId" })
      .populate({
        path: "parentId",
        select: "-__v -password",
      });

    if (!user) {
      return handleError(res, "Tài khoản không tồn tại.");
    }

    if (!user.validPassword(password)) {
      return handleError(res, "Mật khẩu không chính xác.");
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.roleId.code,
        parentId: user.parentId,
        companyId: user.companyId,
        username: user.username,
      },
      config.JWT_SECRET,
      // default expired token la 30 ngay
      { expiresIn: 30 * 60 * 60 * 1000 }
    );

    let userWithoutPassword = { ...user._doc };
    delete userWithoutPassword["password"];
    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    return handleError(res, error.message);
  }
};

const postSignUp = async (req, res, next) => {
  console.log("postSignUp");
  const {
    _id,
    username,
    password,
    name,
    phoneNumber,
    roleId,
    companyId,
  } = req.body;
  listKey.map((key) => {
    if (!req.body[key]) {
      return handleError(res, `${key} không được để trống.`);
    }
  });
  try {
    const user = await userModel.findOne({ username }, "-__v");

    let dataUser = { ...req.body };

    if (_id) {
      dataUser._id = Types.ObjectId(id);
    } else {
      dataUser._id = Types.ObjectId();
    }

    if (user) {
      throw new Error(`Tài khoản ${user.username} đã tồn tại`);
      // return handleError(res, `Tài khoản ${user.username} đã tồn tại`);
    }
    if (companyId) {
      // khong phai admin system thi tao person
      let createPerson = await resources.createPerson(
        companyId,
        dataUser._id,
        name
      );
      if (createPerson.status === 200) {
        console.log("create person success");
        dataUser = {
          ...dataUser,
          personId: createPerson?.data?.personId,
        };
      } else {
        return handleError(res);
      }
    }

    let newUser = new userModel(dataUser);
    const passwordHash = await newUser.encryptPassword(password);
    newUser.password = passwordHash;

    let savedUser = await newUser.save();
    savedUser = await userModel.populate(savedUser, {
      path: "roleId companyId parentId",
      select: "-__v -password",
    });
    if (!savedUser) return handleError("Lỗi khi lưu thông tin user");

    let userWithoutPassword = { ...savedUser._doc };
    delete userWithoutPassword["password"];
    return res.status(201).json(savedUser);
  } catch (error) {
    console.log("postSignUp ~ error", error.message);
    return handleError(res, error.message);
  }
};

export default {
  postSignIn,
  postSignUp,
};
