const express = require('express');
const router = express.Router();
const Booking = require('../models/bookings');

// Create a booking
router.post('/', async (req, res) => {
  try {
    const { username, lab, date, time } = req.body;

    // Check if same slot already booked
    const existing = await Booking.findOne({ username, lab, date, time });
    if (existing) return res.status(400).json({ message: 'Slot already booked' });

    const booking = new Booking({ username, lab, date, time });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all bookings by user
router.get('/:username', async (req, res) => {
  try {
    const bookings = await Booking.find({ username: req.params.username });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking
router.delete('/', async (req, res) => {
  try {
    const { username, lab, date, time } = req.body;
    const result = await Booking.findOneAndDelete({ username, lab, date, time });
    if (!result) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;