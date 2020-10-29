var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
var passport = require("passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).json({ msg: "Home Page" });
});

module.exports = router;
