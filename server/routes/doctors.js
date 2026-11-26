const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const ALL_SLOTS = ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM'];

const doctorValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('speciality').trim().notEmpty().withMessage('Speciality is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a number'),
  body('fee').isFloat({ min: 0 }).withMessage('Fee must be a number'),
  body('availableDays').optional().isArray(),
];

function validationErrors(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ message: errors.array()[0].msg });
  return true;
}

// GET /api/doctors?search=&speciality=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      const rx = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [{ name: rx }, { speciality: rx }];
    }
    if (req.query.speciality && req.query.speciality !== 'All') {
      filter.speciality = new RegExp(`^${req.query.speciality}$`, 'i');
    }
    const doctors = await Doctor.find(filter).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
});

// GET /api/doctors/:id/slots?date=YYYY-MM-DD -> booked slots
router.get('/:id/slots', async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param is required' });
    const booked = await Appointment.find({
      doctor: req.params.id,
      date,
      status: 'Booked',
    }).select('slot');
    res.json({ slots: booked.map((a) => a.slot), allSlots: ALL_SLOTS });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch slots', error: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor', error: err.message });
  }
});

// POST /api/doctors (admin)
router.post('/', auth, adminOnly, doctorValidation, async (req, res) => {
  try {
    if (validationErrors(req, res)) return;
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create doctor', error: err.message });
  }
});

// PUT /api/doctors/:id (admin)
router.put('/:id', auth, adminOnly, doctorValidation, async (req, res) => {
  try {
    if (validationErrors(req, res)) return;
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update doctor', error: err.message });
  }
});

// DELETE /api/doctors/:id (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete doctor', error: err.message });
  }
});

module.exports = router;
