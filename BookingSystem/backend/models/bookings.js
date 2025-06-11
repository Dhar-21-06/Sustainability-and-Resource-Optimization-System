const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  username: String,
  lab: String,
  date: String,
  time: String,
}, {
  timestamps: true // optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Booking', bookingSchema);