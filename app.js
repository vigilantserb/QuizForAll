//preinstalled dependencies
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

//my dependencies
const hbs = require("hbs");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

const app = express();

// Passport Config
require("./config/passport")(passport);

const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.set("views", [path.join(__dirname, "views"), path.join(__dirname, "/views/api/question"), path.join(__dirname, "/views/api/player"), path.join(__dirname, "/views/api/quiz")]);
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/index"));
app.use("/player", require("./routes/player.api"));
app.use("/question", require("./routes/question"));
app.use("/quiz", require("./routes/quiz"));
app.use("/user", require("./routes/users"));
app.use("/about", require("./routes/about"));
app.use("/submit", require("./routes/submit"));

app.use("/mobile", require("./routes/mobile"));

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (req.originalUrl.includes("mobile")) {
    return res.status(500).send({ message: "Internal server error", error: err });
  } else {
    // render the error page
    res.status(err.status || 500);
    res.render("error");
  }
});

module.exports = app;
