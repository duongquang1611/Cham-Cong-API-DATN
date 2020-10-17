var express = require("express");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const errorCode = require("../../config/errorCode");
const resCustom = require("../../config/resCustom");
var router = express.Router();
var User = require("../../models/user.model");
var jwt = require("jsonwebtoken");
var { JWT_SECRET } = require("../../config");
console.log("JWT_SECRET", JWT_SECRET);
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

// all user
router.get("/", (req, res) => {
  User.find()
    .sort({ updatedAt: -1 }) // new to old
    .then((items) => res.json(items));
  //   res.json({ a: 1 });
});

// delete user
router.delete("/:id", (req, res) => {
  User.findById(req.params.id)
    .then((item) => {
      return item.remove().then(() => res.json({ success: true }));
    })
    .catch((err) => {
      return res.status(404).json({ success: false });
    });
});

router.post("/signup", async (req, res) => {
  const { username, password, name, phoneNumber, roleId } = req.body;
  listKey.map((key) => {
    if (!req.body[key]) {
      console.log("key", key);
      return resCustom(400, res, { msg: `${key} không được để trống.` });
    }
  });
  try {
    const user = await User.findOne({ username });
    if (user) throw Error(`Tài khoản ${user.username} đã tồn tại`);

    let newUser = new User({
      username,
      name,
      phoneNumber,
      roleId,
    });
    const passwordHash = await newUser.encryptPassword(password);
    newUser.password = passwordHash;

    const savedUser = await newUser.save();

    if (!savedUser) throw Error("Lỗi khi lưu thông tin user");

    const token = jwt.sign(
      {
        id: savedUser._id,
        roleId: savedUser.roleId,
        username: savedUser.username,
      },
      JWT_SECRET,
      { expiresIn: 36000000 }
    );
    return res.status(201).json({ token, user: savedUser });
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
    res.status(400).json({ error: error.message });
  }
});

// router.post(
//   "/signup",
//   [
//     // check("email", "Your username is not valid").isEmail(),
//     check("password", "Your password must be at least 5 characters").isLength({
//       min: 5,
//     }),
//   ],
//   function (req, res, next) {
//     var messages = req.flash("error");
//     const result = validationResult(req);
//     var errors = result.errors;
//     if (!result.isEmpty()) {
//       var messages = [];
//       errors.forEach(function (error) {
//         messages.push(error.msg);
//       });
//       res.render("signup", {
//         messages: messages,
//         hasErrors: messages.length > 0,
//       });
//     } else {
//       next();
//     }
//   },
//   passport.authenticate("local.signup", {
//     successRedirect: "/api/users",
//     failureRedirect: "/api/users",
//     failureFlash: true,
//   })
// );
module.exports = router;
