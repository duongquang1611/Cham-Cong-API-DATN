var express = require("express");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const errorCode = require("../../config/errorCode");
const resCustom = require("../../config/resCustom");
var router = express.Router();
var User = require("../../models/user.model");
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

router.post("/signup", (req, res) => {
  const { username, password, name, phoneNumber, roleId } = req.body;
  listKey.map((key) => {
    if (!req.body[key]) {
      console.log("key", key);
      return resCustom(400, res, { msg: `${key} không được để trống.` });
    }
  });

  User.findOne({ username }).then((user) => {
    if (user) {
      return resCustom(400, res, {
        msg: `Tài khoản ${user.username} đã tồn tại`,
      });
    }

    const newUser = new User({
      username,
      password,
      name,
      phoneNumber,
      roleId,
      updatedAt: Date.now(),
    });
    newUser.password = newUser.encryptPassword(password);
    newUser.save(function (err, user) {
      if (err) {
        return res.status(400).json({
          msg: `${Object.entries(err.keyValue)
            .toString()
            .replace(",", ":")} không hợp lệ.`,
        });
      }
      return res.status(201).json(user);
    });
  });
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
