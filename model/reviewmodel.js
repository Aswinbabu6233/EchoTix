const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: "Concert" },
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
