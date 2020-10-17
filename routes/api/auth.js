import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../../models/user.model.js";
import config from "../../config/index.js";
var router = express.Router();
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

router.post("/signup", async (req, res) => {
  const { username, password, name, phoneNumber, roleId } = req.body;
  listKey.map((key) => {
    if (!req.body[key]) {
      res.status(400).json({ msg: `${key} không được để trống.` });
    }
  });
  try {
    const user = await userModel.findOne({ username });
    if (user)
      res.status(400).json({ msg: `Tài khoản ${user.username} đã tồn tại` });

    let newUser = new userModel({
      username,
      name,
      phoneNumber,
      roleId,
    });
    const passwordHash = await newUser.encryptPassword(password);
    newUser.password = passwordHash;

    const savedUser = await newUser.save();

    if (!savedUser) res.status(400).json({ msg: "Lỗi khi lưu thông tin user" });

    const token = jwt.sign(
      {
        id: savedUser._id,
        roleId: savedUser.roleId,
        username: savedUser.username,
      },
      config.JWT_SECRET,
      { expiresIn: 36000000 }
    );
    let userWithoutPassword = { ...savedUser._doc };
    delete userWithoutPassword["password"];
    return res.status(201).json({ token, user: userWithoutPassword });

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
    res.status(400).json({ msg: error.message });
  }
});

export default router;
