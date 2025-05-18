const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const User = require("../model/usermodel");
const { route } = require(".");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// getuser register page

router.get("/register", (req, res) => {
  res.render("common/register", { errors: [] });
});

router.post(
  "/newaccount",
  upload.single("profilephoto"),
  [
    // validation code here
    body("username").notEmpty().withMessage("Username is required"),
    body("email").notEmpty().isEmail().withMessage("Invalid Email"),
    body("password")
      .notEmpty()
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("common/register", { errors: errors.array() });
    }
    const { email } = req.body;
    const existUser = await User.find({ email });
    if (existUser.length > 0) {
      return res.render("common/register", {
        errors: [{ msg: "Email already exists" }],
      });
    }
    const { username } = req.body;
    const existUsername = await User.find({ username });
    if (existUsername.length > 0) {
      return res.render("common/register", {
        errors: [{ msg: "Username already exists" }],
      });
    }

    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newuser = new User({
        username: username.trim(),
        email: email.trim(),
        password: hashedPassword,
        profileImage: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });
      await newuser.save();
      req.session.user = { _id: newuser._id };
      res.redirect("/");
    } catch (error) {
      console.error("Registration error:", error);
      res.render("common/register", {
        errors: [{ msg: "Server error occured while registering" }],
      });
    }
  }
);

router.get("/login", (req, res) => {
  res.render("common/login", { errors: [] });
});

router.post(
  "/Login",
  [
    body("email").isEmail().withMessage("Valid Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("common/login", { errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.render("common/login", {
          errors: [{ msg: "Email not found" }],
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render("common/login", {
          errors: [{ msg: "Incorrect password" }],
        });
      }
      req.session.user = { _id: user._id };
      res.redirect("/");
    } catch (err) {
      console.error("Login error:", err);
      res.render("common/login", {
        errors: [{ msg: "Server error. Please try again later." }],
      });
    } finally {
      req.session.save();
    }
  }
);

module.exports = router;
