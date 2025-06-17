const mongoose = require("mongoose");

const labSchema = new mongoose.Schema({
name: {
type: String,
required: true,
unique: true,
},
description: String,
incharge: {
name: String,
phone: String,
email: String,
},
});

const Lab = mongoose.model("Lab", labSchema);
module.exports = Lab;