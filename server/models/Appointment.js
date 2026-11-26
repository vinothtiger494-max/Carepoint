const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    slot: { type: String, required: true }, // e.g. "09:00 AM"
    reason: { type: String, default: '' },
    status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' },
  },
  { timestamps: true }
);

// Prevent double booking: one Booked appointment per doctor+date+slot.
appointmentSchema.index(
  { doctor: 1, date: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Booked' },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
