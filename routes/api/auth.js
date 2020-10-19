import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../../models/user.model.js";
import config from "../../config/index.js";
import handleError from "../../commons/handleError.js";
var router = express.Router();
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await await userModel.findOne({ username }, "-__v");

    if (!user) {
      return handleError(res, "Tài khoản không tồn tại.");
    }

    if (!user.validPassword(password)) {
      return handleError(res, "Mật khẩu không chính xác.");
    }

    const token = jwt.sign(
      {
        _id: user._id,
        roleId: user.roleId,
        username: user.username,
      },
      config.JWT_SECRET,
      { expiresIn: 36000000 }
    );

    let userWithoutPassword = { ...user._doc };
    delete userWithoutPassword["password"];
    return res.json({ token, user: userWithoutPassword });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, name, phoneNumber, roleId } = req.body;
  listKey.map((key) => {
    if (!req.body[key]) {
      return handleError(res, `${key} không được để trống.`);
    }
  });
  try {
    const user = await userModel.findOne({ username }, "-__v");

    if (user) {
      return handleError(res, `Tài khoản ${user.username} đã tồn tại`);
    }

    let newUser = new userModel({
      username,
      name,
      phoneNumber,
      roleId,
    });
    const passwordHash = await newUser.encryptPassword(password);
    newUser.password = passwordHash;

    const savedUser = await newUser.save();

    if (!savedUser) return handleError("Lỗi khi lưu thông tin user");

    let userWithoutPassword = { ...savedUser._doc };
    delete userWithoutPassword["password"];
    return res.status(201).json(userWithoutPassword);

    // newUser.save(function (err, user) {
    //   if (err) {
    //     return res.status(400).json({
    //       msg: `${Object.entries(err.keyValue)
    //         .toString()
    //         .replace(",", ":")} không hợp lệ.`,
    //     });
    //   }
    //   return res.status(201).json(user);
    // });
  } catch (error) {
    return handleError(res, error.message);
  }
});

export default router;
