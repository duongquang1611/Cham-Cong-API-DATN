var express = require("express");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const errorCode = require("../../config/errorCode");
var router = express.Router();
var Account = require("../../models/account.model");

router.get("/", (req, res) => {
  Account.find()
    .sort({ updatedAt: -1 }) // new to old
    .then((items) => res.json(items));
  //   res.json({ a: 1 });
});

router.post(
  "/signup",
  [
    // check("email", "Your username is not valid").isEmail(),
    check("password", "Your password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  function (req, res, next) {
    var messages = req.flash("error");
    const result = validationResult(req);
    var errors = result.errors;
    if (!result.isEmpty()) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      res.render("signup", {
        messages: messages,
        hasErrors: messages.length > 0,
      });
    } else {
      next();
    }
  },
  passport.authenticate("local.signup", {
    successRedirect: "/api/accounts",
    failureRedirect: "/api/accounts",
    failureFlash: true,
  })
);

router.delete("/:id", (req, res) => {
  Account.findById(req.params.id)
    .then((item) => {
      return item.remove().then(() => res.json({ success: true }));
    })
    .catch((err) => {
      return res.status(404).json({ success: false });
    });
});

module.exports = router;
