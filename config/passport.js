// config/passport.js
// load các module
var passport = require("passport");
// load  account model
var Account = require("../models/account.model");
var LocalStrategy = require("passport-local").Strategy;

// passport session setup

// used to serialize the account for the session
passport.serializeUser(function (account, done) {
  done(null, account.id);
});
// used to deserialize the account
passport.deserializeUser(function (id, done) {
  Account.findById(id, function (err, account) {
    done(err, account);
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

      Account.findOne({ username: username }, function (err, account) {
        console.log("account", account);
        console.log("err", err);
        if (err) {
          return done(err);
        }
        if (account) {
          return done(null, false, { message: "username is already in use." });
        }
        var newUser = new Account();
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
      Account.findOne({ username: username }, function (err, account) {
        if (err) {
          console.log("err", err);
          return done(err);
        }
        if (!account) {
          console.log("account", account);
          return done(null, false, { message: "Not account found" });
        }
        if (!account.validPassword(password)) {
          console.log("account", account);
          return done(null, false, { message: "Wrong password" });
        }
        return done(null, account);
      });
    }
  )
);
