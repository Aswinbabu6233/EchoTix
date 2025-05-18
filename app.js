var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./database/db");
var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var userRouter = require("./routes/user");
const session = require("express-session");
const User = require("./model/usermodel");

const expressLayouts = require("express-ejs-layouts");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//layout setup

// session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "BlueEyeTen",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(async (req, res, next) => {
  if (req.session.user && req.session.user._id) {
    try {
      const user = await User.findById(req.session.user._id).lean();
      if (user) {
        res.locals.userdetails = user;
        res.locals.userpresent = user.role === "user";
        res.locals.adminpresent = user.role === "admin";
      } else {
        res.locals.userdetails = null;
        res.locals.userpresent = false;
        res.locals.adminpresent = false;
      }
    } catch (err) {
      console.error("Session fetch error:", err);
      res.locals.userdetails = null;
      res.locals.userpresent = false;
      res.locals.adminpresent = false;
    }
  } else {
    res.locals.userdetails = null;
    res.locals.userpresent = false;
    res.locals.adminpresent = false;
  }
  next();
});

app.use(expressLayouts);
app.set("layout", "layouts/main-layout");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);

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

module.exports = app;
