const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    speciality: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, min: 0 },
    fee: { type: Number, required: true, min: 0 },
    availableDays: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
