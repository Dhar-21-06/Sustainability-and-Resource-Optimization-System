const mongoose = require("mongoose");

const auditoriumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  capacity: Number,
  location: String,
  incharge: [
    {
      name: String,
      email: String,
      phone: String
    }
  ]
});

const Auditorium = mongoose.model("Auditorium", auditoriumSchema);
module.exports = Auditorium;
