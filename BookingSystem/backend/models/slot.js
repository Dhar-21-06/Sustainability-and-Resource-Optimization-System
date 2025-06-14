const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  lab: String,
  date: String,
  time: String,
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('Slot', slotSchema);
