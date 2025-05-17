const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  city: { type: String, required: true },
  venue: { type: String, required: true },
  locationMapUrl: { type: String, default: "" },
  ticketPrice: { type: Number, required: true },
  totalTickets: { type: Number, required: true },
  ticketsAvailable: { type: Number, required: true },
  bookingEndsAt: { type: Date },
  concertImage: {
    data: Buffer,
    contentType: String,
  },
  band: { type: mongoose.Schema.Types.ObjectId, ref: "Band" },
  tags: [String],
  status: {
    type: String,
    enum: ["upcoming", "sold_out", "canceled"],
    default: "upcoming",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Consert = mongoose.model("Concert", concertSchema);

module.exports = Consert;
