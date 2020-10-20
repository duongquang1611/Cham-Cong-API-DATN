import dotenv from "dotenv";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import passport from "passport";
import flash from "connect-flash";
import session from "express-session";
import config from "./config/index.js";

// import indexRouter from "./routes/api/index"
import initial from "./models/initial.js";

import apiUserRouters from "./api/routes/user.route.js";
import apiAuthRouters from "./api/routes/auth.route.js";
import apiRoleRouters from "./api/routes/role.route.js";
import apiCompanyRouters from "./api/routes/company.route.js";

dotenv.config();
var app = express();

// path database
mongoose
  .connect(config.MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // disable warning findByIdAndUpdate
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
app.set("views", path.join(path.dirname(""), "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(path.dirname(''), "public")));

//setup router to deploy
// app.use("/", indexRouter);
app.use("/api/users", apiUserRouters);
app.use("/api/auth", apiAuthRouters);
app.use("/api/roles", apiRoleRouters);
app.use("/api/companies", apiCompanyRouters);

if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(path.dirname(""), "client", "build")));

  // ...
  // Right before your app.listen(), add this:
  app.get("*", (req, res) => {
    res.sendFile(path.join(path.dirname(""), "client", "build", "index.html"));
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
app.listen(config.PORT || 5000, () => {
  console.log("Server running in post " + config.PORT || 5000);
});

export default app;

// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm install --prefix client && npm run build --prefix client"
