import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

const postSignIn = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    let user = await userModel
      .findOne({ username })
      .select("-__v")
      .populate({ path: "roleId" })
      .populate({ path: "companyId" });
    // .populate({
    //   path: "parentId",
    //   select: "-__v -password",
    // });

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
    handleError(res, error);
  }
};

const postSignUp = async (req, res, next) => {
  const { username, password, name, phoneNumber, roleId } = req.body;
  listKey.map((key) => {
    if (!req.body[key]) {
      return handleError(res, `${key} không được để trống.`);
    }
  });
  try {
    const user = await userModel.findOne({ username }, "-__v");

    if (user) {
      throw new Error(`Tài khoản ${user.username} đã tồn tại`);
      // return handleError(res, `Tài khoản ${user.username} đã tồn tại`);
    }

    let newUser = new userModel({
      ...req.body,
    });
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
};

export default {
  postSignIn,
  postSignUp,
};
