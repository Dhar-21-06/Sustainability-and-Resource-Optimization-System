const express = require("express");
const router = express.Router();
const Lab = require("../models/lab");
const Auditorium = require("../models/audi");

// Add a new auditorium
router.post("/auditoriums", async (req, res) => {
  try {
    const auditorium = new Auditorium(req.body);
    await auditorium.save();
    res.status(201).json(auditorium);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all auditoriums
router.get("/auditoriums", async (req, res) => {
  try {
    const auditoriums = await Auditorium.find({});
    res.status(200).json(auditoriums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all labs
router.get("/", async (req, res) => {
try {
const labs = await Lab.find();
res.json(labs);
} catch (err) {
res.status(500).json({ error: "Server error" });
}
});

// Add new lab (optional, useful for testing)
router.post("/", async (req, res) => {
try {
const lab = new Lab(req.body);
await lab.save();
res.status(201).json(lab);
} catch (err) {
res.status(400).json({ error: err.message });
}
});

module.exports = router;