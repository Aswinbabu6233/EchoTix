const mongoose = require("mongoose");

const bandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discription: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Band = mongoose.model("Band", bandSchema);

module.exports = Band;
