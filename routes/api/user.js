import express from "express";
import auth from "../../middleware/auth.js";
import userModel from "../../models/user.model.js";

var router = express.Router();
const listKey = ["username", "password", "name", "phoneNumber", "roleId"];

// all user
router.get("/", auth, (req, res) => {
  userModel
    .find()
    .sort({ updatedAt: -1 }) // new to old
    .select("-password")
    .then((items) => res.json(items));
});

// delete user
router.delete("/:id", auth, (req, res) => {
  userModel
    .findById(req.params.id)
    .then((item) => {
      return item
        .remove()
        .then(() =>
          res.json({ msg: `Xóa userId: ${req.params.id} thành công` })
        );
    })
    .catch((err) => {
      return res
        .status(404)
        .json({ msg: `userId: ${req.params.id} không tồn tại.` });
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
export default router;
