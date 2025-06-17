const express = require("express");
const router = express.Router();
const Lab = require("../models/lab");

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