const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const { generatePasswordResetPage, generateAccountConfirmationPage } = require("../api/utils");

module.exports.loginPageView = (req, res) => res.render("login", { style: "style.css" });

module.exports.registerPageView = (req, res) => res.render("register", { style: "style.css" });

module.exports.forgotPasswordView = (req, res) => res.render("forgot-password", { style: "style.css" });

module.exports.resetPasswordView = (req, res) => {
  res.render("reset-password", {
    token: req.params.token,
    style: "style.css"
  });
};

module.exports.resetPasswordMongoose = (req, res, next) => {
  let { password, password2, token } = req.body;
  let errors = [];

  if (!token) {
    req.flash("error_msg", "No token provided.");
    return res.redirect("/user/login");
  }

  if (!password || !password2) {
    errors.push({ msg: "Please enter all fields." });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be longer than 6 characters." });
  }

  if (errors.length > 0) {
    res.render("reset-password", {
      errors,
      password,
      password2
    });
  } else {
    jwt.verify(token, require("../config/keys").secret, function(err, decoded) {
      if (err) next(err);
      if (!decoded) {
        req.flash("error_msg", "Access token expired. Try again.");
        res.redirect("/user/login");
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) return next(err);
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) return next(err);
            User.findOneAndUpdate({ email: decoded.email }, { password: hash })
              .then(user => {
                req.flash("success_msg", "Password change successful.");
                res.redirect("/user/login");
              })
              .catch(err => {
                return next(err);
              });
          });
        });
      }
    });
  }
};

module.exports.forgotPasswordMongoose = (req, res, next) => {
  let email = req.body.email;
  let errors = [];
  if (!email) {
    errors.push({ msg: "Please enter an email address." });
  }

  if (errors.length > 0) {
    res.render("forgot-password", {
      errors,
      email
    });
  } else {
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          errors.push({ msg: "No user with that email has been found." });
        } else {
          generatePasswordResetPage(email);
        }

        if (errors.length > 0) {
          res.render("forgot-password", {
            errors,
            email
          });
        } else {
          req.flash("success_msg", "Recovery mail sent successfully.");
          res.redirect("/user/login");
        }
      })
      .catch(err => {
        return next(err);
      });
  }
};

module.exports.registerMongoose = (req, res, next) => {
  const { firstname, lastname, email, password, password2 } = req.body;
  let errors = [];

  if (!firstname || !lastname || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      firstname,
      lastname,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          errors.push({ msg: "Email already exists" });
          res.render("register", {
            errors,
            firstname,
            lastname,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            firstname,
            lastname,
            email,
            password
          });

          bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) return next(err);
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  generateAccountConfirmationPage(user.email);
                  req.flash("success_msg", "You are now registered. Check your email for a confirmation link.");
                  res.redirect("/user/login");
                })
                .catch(err => next(err));
            });
          });
        }
      })
      .catch(err => next(err));
  }
};

module.exports.loginPassport = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    req.flash("error_msg", "Please fill all fields.");
    return res.redirect("/user/login");
  }
  User.findOne({ email: email })
    .then(user => {
      let errors = [];
      if (!user) {
        errors.push({ msg: "No user with that email found" });
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return next(err);
        if (!isMatch) {
          errors.push({ msg: "Wrong password." });
        }
        if (errors.length > 0) {
          return res.render("login", {
            style: "style.css",
            errors
          });
        } else {
          if (!user.isVerified) {
            generateAccountConfirmationPage(user.email);
            req.flash("error_msg", "Please verify your account on the provided link");
            res.redirect("/user/login");
          }

          passport.authenticate("local", {
            successRedirect: "/dashboard",
            failureRedirect: "/user/login",
            failureFlash: true
          })(req, res, next);
        }
      });
    })
    .catch(err => next(err));
};

module.exports.confirmAccountMongoose = (req, res, next) => {
  let { token } = req.params;

  if (!token) {
    req.flash("error_msg", "No token provided.");
    return res.redirect("/user/login");
  }
  jwt.verify(token, require("../config/keys").secret, function(err, decoded) {
    if (err) return next(err);
    if (!decoded) {
      req.flash("error_msg", "Access token expired. Try again.");
      res.redirect("/user/login");
    } else {
      User.findOneAndUpdate({ email: decoded.email }, { isVerified: true })
        .then(user => {
          req.flash("success_msg", "Account confirmation successful.");
          res.redirect("/user/login");
        })
        .catch(err => next(err));
    }
  });
};

module.exports.logoutPassport = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/user/login");
};
