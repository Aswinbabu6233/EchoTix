const mongoose = require("mongoose");

const bandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discription: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
});
const Band = mongoose.model("Band", bandSchema);

module.exports = Band;
