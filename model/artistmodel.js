const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  photo: {
    data: Buffer,
    contentType: String,
  },
  band: { type: mongoose.Schema.Types.ObjectId, ref: "Band" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Artist = mongoose.model("Artist", memberSchema);
module.exports = Artist;
