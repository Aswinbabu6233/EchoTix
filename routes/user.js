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
      req.session.user = newuser;
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

router.post("/Login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Find user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return res.render("common/login", {
        errors: [{ msg: "Invalid username/email or password" }],
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("common/login", {
        errors: [{ msg: "Invalid username/email or password" }],
      });
    }
    req.session.user = user;
    // Login successful – add session logic or redirect
    // For now just redirecting to home or dashboard
    res.redirect("/"); // Replace with /dashboard or user profile route
  } catch (err) {
    console.error("Login error:", err);
    res.render("common/login", {
      errors: [{ msg: "Server error. Please try again later." }],
    });
  }
});

module.exports = router;
