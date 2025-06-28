const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['admin', 'faculty'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
  type: String
},
bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  read: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);