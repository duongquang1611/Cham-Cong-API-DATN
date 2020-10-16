require("dotenv").config();
require("./config/passport"); //vượt qua passport để config trang đăng nhâp/đăng ký

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var session = require("express-session");

var indexRouter = require("./routes/api/index");
var accountRouters = require("./routes/api/account");
const initial = require("./models/initial");

var app = express();

// path database
mongoose
  .connect(process.env.MONGOURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

app.use(
  session({
    secret: "duongquang",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//setup router to deploy
// app.use("/", indexRouter);
app.use("/api/accounts", accountRouters);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

if (process.env.NODE_ENV === "production") {
  // Set static folder
  // app.use(express.static("client/build"));

  // app.get("*", (req, res) => {
  //   // res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
  //   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  // });
  app.use("*", express.static(path.join(__dirname, "client", "build")));
}

// app.listen((port = 5000), function () {
//   console.log("Server listening connect port " + port);
// });
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running in post " + process.env.PORT);
});

module.exports = app;

// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"
