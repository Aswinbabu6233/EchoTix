const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const multer = require("multer");
const Band = require("../model/bandmodel");
const Artist = require("../model/artistmodel");
const Concert = require("../model/concertmodel");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// band upload
router.get("/create/band", async (req, res) => {
  res.render("Admin/Addband", { errors: [] });
});

router.post(
  "/create/bandsubmit",
  upload.single("bandimg"),
  [
    body("bandname").notEmpty().withMessage("Band Name is required"),
    body("banddiscription")
      .notEmpty()
      .withMessage("Band discription in required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("Admin/Addband", {
        errors: errors.array(),
      });
    }

    if (!req.file) {
      return res.render("Admin/Addband", {
        errors: [{ msg: "Band image is required" }],
      });
    }

    try {
      const { bandname, banddiscription } = req.body;

      const band = new Band({
        name: bandname.trim(),
        discription: banddiscription.trim(),
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });

      await band.save();
      res.redirect("/admin/create/band"); // Adjust path as needed
    } catch (error) {
      console.error("Error while saving band details:", error);
      res.status(500).render("Admin/Addband", {
        errors: [{ msg: "An error occurred while saving the band data" }],
      });
    }
  }
);

// GET /create/artist
router.get("/create/artist", async (req, res) => {
  try {
    const bands = await Band.find({});
    res.render("Admin/AddArtist", { bands, errors: [] }); // send bands to EJS
  } catch (error) {
    console.error("Error while finding band details:", error);
    res.status(500).render("Admin/AddArtist", {
      bands: [],
      errors: [{ msg: "An error occurred while fetching band data" }],
    });
  }
});

// POST route to handle form submission
router.post("/artists", upload.array("photos"), async (req, res) => {
  const { bandId, name, role } = req.body;
  const photos = req.files;

  try {
    if (!Array.isArray(name) || !Array.isArray(role) || photos.length === 0) {
      return res.status(400).render("Admin/AddArtist", {
        errors: [
          { msg: "All fields are required and must be equal in count." },
        ],
        bands: await Band.find({}),
      });
    }
    const ArtistData = [];
    for (let i = 0; i < name.length; i++) {
      ArtistData.push({
        name: name[i].trim(),
        role: role[i].trim(),
        band: bandId,
        photo: {
          data: photos[i].buffer,
          contentType: photos[i].mimetype,
        },
      });
    }
    await Artist.insertMany(ArtistData);
    res.redirect("/admin/create/artist");
    console.log("Artist uploaded sucess");
  } catch (error) {
    console.error("Error Creating Artists:", error);
    res.status(500).render("Admin/AddArtist", {
      errors: [{ msg: "Server error occured while saving Artists Data" }],
      bands: await Band.find({}),
    });
  }
});
// concert creation
router.get("/create/concerts", async (req, res) => {
  try {
    const bands = await Band.find({});
    res.render("Admin/Addconcert", { bands, errors: [] });
  } catch (err) {
    console.error(err);
    res.render("Admin/Addconcert", {
      bands: [],
      errors: [{ msg: "Failed to load bands." }],
    });
  }
});

// concert creation post

router.post(
  "/concerts",
  upload.single("concertImage"),
  [
    body("title").notEmpty().trim().withMessage("Concert title is required"),
    body("description")
      .notEmpty()
      .trim()
      .withMessage("Description is required"),
    body("date").notEmpty().withMessage("Concert date is required"),
    body("time").notEmpty().trim().withMessage("Start time is required"),
    body("duration")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Duration must be a number (min 1)"),
    body("city").notEmpty().trim().withMessage("City is required"),
    body("venue").notEmpty().trim().withMessage("Venue is required"),
    body("locationMapUrl")
      .optional({ checkFalsy: true })
      .trim()
      .isURL()
      .withMessage("Invalid Map URL"),
    body("ticketPrice")
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Valid ticket price is required"),
    body("totalTickets")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Total tickets must be at least 1"),
    body("ticketsAvailable")
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Tickets available must be 0 or more"),
    body("band").notEmpty().trim().withMessage("Band is required"),
    body("tags").optional().trim(),
    body("bookingEndsAt")
      .optional()
      .trim()
      .isISO8601()
      .withMessage("Invalid booking end time"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("Admin/Addconcert", {
        bands: await Band.find({}),
        errors: errors.array(),
      });
    }

    try {
      const {
        title = "",
        description = "",
        date,
        time,
        duration,
        city = "",
        venue = "",
        locationMapUrl = "",
        ticketPrice,
        totalTickets,
        ticketsAvailable,
        bookingEndsAt,
        tags = "",
        band,
      } = req.body;

      const concert = new Concert({
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        time: time.trim(),
        duration: parseInt(duration),
        city: city.trim().tolowerCase(),
        venue: venue.trim(),
        locationMapUrl: locationMapUrl.trim(),
        ticketPrice: parseFloat(ticketPrice),
        totalTickets: parseInt(totalTickets),
        ticketsAvailable: parseInt(ticketsAvailable),
        bookingEndsAt: bookingEndsAt ? new Date(bookingEndsAt) : null,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        band: band.trim(),
      });

      if (req.file) {
        concert.concertImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      await concert.save();
      res.redirect("/admin/create/concerts");
    } catch (error) {
      console.error("Concert creation error:", error);
      res.status(500).render("Admin/Addconcert", {
        bands: await Band.find({}),
        errors: [{ msg: "Something went wrong while saving the concert." }],
      });
    }
  }
);
module.exports = router;
