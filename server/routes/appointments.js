const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

const ALL_SLOTS = ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM'];

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ message: errors.array()[0].msg });
  return true;
}

function isPastDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) || d < today;
}

// POST /api/appointments - book (patient, protected)
router.post(
  '/',
  auth,
  [
    body('doctorId').isMongoId().withMessage('Invalid doctor'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
    body('slot').notEmpty().withMessage('Time slot is required'),
    body('reason').optional().isString(),
  ],
  async (req, res) => {
    try {
      if (validationErrors(req, res)) return;
      const { doctorId, date, slot, reason } = req.body;

      if (!ALL_SLOTS.includes(slot)) {
        return res.status(400).json({ message: 'Invalid time slot' });
      }
      if (isPastDate(date)) {
        return res.status(400).json({ message: 'Cannot book an appointment in the past' });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

      const existing = await Appointment.findOne({ doctor: doctorId, date, slot, status: 'Booked' });
      if (existing) {
        return res.status(409).json({ message: 'Slot already booked' });
      }

      const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        date,
        slot,
        reason: reason || '',
        status: 'Booked',
      });

      res.status(201).json(appointment);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Slot already booked' });
      }
      res.status(500).json({ message: 'Booking failed', error: err.message });
    }
  }
);

// GET /api/appointments - all appointments (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality')
      .sort({ date: 1, slot: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// GET /api/appointments/my - patient's own appointments
router.get('/my', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name speciality fee')
      .sort({ date: 1, slot: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// PUT /api/appointments/:id/cancel - owner only
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment id' });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isOwner = appointment.patient.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Cancel failed', error: err.message });
  }
});

module.exports = router;
