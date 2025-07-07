const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  lab: { type: String, required: true }, // can also be an auditorium name
  type: {
    type: String,
    enum: ['lab', 'auditorium'], // ✅ differentiate between lab and auditorium
    required: true
  },

  date: { type: String, required: true },
  time: { type: String, required: true },
  purpose: { type: String, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Pending',
  },

  requestedAt: { type: Date, default: Date.now },
  rejectionTimestamp: { type: Date },
  rejectionReason: { type: String }
});

module.exports = mongoose.model('Booking', bookingSchema);