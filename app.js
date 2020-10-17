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
var { PORT, MONGO_URI, JWT_SECRET, NODE_ENV } = require("./config");

var indexRouter = require("./routes/api/index");
var userRouters = require("./routes/api/user");
const initial = require("./models/initial");

var app = express();

// path database
mongoose
  .connect(MONGO_URI, {
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
// app.use(express.static(path.join(__dirname, "public")));

//setup router to deploy
// app.use("/", indexRouter);
app.use("/api/users", userRouters);

if (NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "client", "build")));

  // ...
  // Right before your app.listen(), add this:
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

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

// app.listen((port = 5000), function () {
//   console.log("Server listening connect port " + port);
// });
app.listen(PORT || 5000, () => {
  console.log("Server running in post " + PORT);
});

module.exports = app;

// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"
