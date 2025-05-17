const express = require("express");
const router = express.Router();
const Concert = require("../model/concertmodel");
const Band = require("../model/bandmodel");
const Artists = require("../model/artistmodel");

router.get("/", async (req, res) => {
  try {
    const { city, query } = req.query;
    const cityFilter = city && city.toLowerCase() !== "all" ? { city } : {};

    let bandIds = [];
    if (query) {
      // Find bands whose name matches query (case-insensitive)
      const bands = await Band.find({
        name: { $regex: query, $options: "i" },
      }).select("_id");
      bandIds = bands.map((band) => band._id);
    }

    // Build concert query
    const concertQuery = {
      ...cityFilter,
      ...(query && {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
          { band: { $in: bandIds } },
        ],
      }),
    };

    // Fetch concerts with populated band info
    const concerts = await Concert.find(concertQuery)
      .populate("band")
      .sort({ date: 1 })
      .lean();

    // Get city list for dropdown
    const cities = (await Concert.distinct("city")).sort();

    // Convert time
    concerts.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });

    res.render("common/home", {
      concerts,
      cities,
      selectedCity: city || "All",
      query,
      convertTo12Hour,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading concerts:", error);
    res.status(500).send("Server Error");
  }
});
// Time format helper
function convertTo12Hour(time24) {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
}

// concert detail
router.get("/concert/:id", async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id)
      .populate("band")
      .lean();
    const artists = await Artists.find({ band: concert.band._id }).lean();

    if (!concert) {
      return res.status(404).send("Concert not found");
    }

    const hours = Math.floor(concert.duration / 60);
    const minutes = concert.duration % 60;
    concert.durationFormatted = `${hours > 0 ? hours + " hr" : ""} ${
      minutes > 0 ? minutes + " min" : ""
    }`.trim();

    concert.time12hr = convertTo12Hour(concert.time);

    res.render("common/concert", { artists, concert });
  } catch (error) {
    console.error("Error loading concert:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/concert/band/:id", async (req, res) => {
  try {
    const band = await Band.findById(req.params.id).lean();
    const concerts = await Concert.find({ band: band._id }).lean();
    const artists = await Artists.find({ band: band._id }).lean();
    res.render("common/Bandprofile", { band, concerts, artists });
  } catch (error) {
    console.error("Error loading band:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
