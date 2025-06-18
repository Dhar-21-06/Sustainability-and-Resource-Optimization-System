// models/profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin','faculty']
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  labIncharge: {
    type: String, // Lab name if admin, empty string for faculty
    default: ''
  },
  department: {
    type: String, // only for faculty
    default: ''
  },
  phoneNumber: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
