// config/passport.js
// load các module
var passport = require("passport");
// load  user model
var User = require("../models/user.model");
var LocalStrategy = require("passport-local").Strategy;

// passport session setup

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
// local sign-up
passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      console.log("username, password", username, password);

      User.findOne({ username: username }, function (err, user) {
        console.log("user", user);
        console.log("err", err);
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, { message: "username is already in use." });
        }
        var newUser = new User();
        newUser.username = username;
        newUser.password = newUser.encryptPassword(password);
        newUser.updateAt = Date.now;
        newUser.save(function (err, result) {
          console.log("result", result);
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    }
  )
);
// local sign-in
passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          console.log("err", err);
          return done(err);
        }
        if (!user) {
          console.log("user", user);
          return done(null, false, { message: "Not user found" });
        }
        if (!user.validPassword(password)) {
          console.log("user", user);
          return done(null, false, { message: "Wrong password" });
        }
        return done(null, user);
      });
    }
  )
);
