const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const DOCTORS = [
  { name: 'Dr. Anitha Kumar', speciality: 'Cardiologist', experience: 8, fee: 500 },
  { name: 'Dr. Rajesh M', speciality: 'General Physician', experience: 10, fee: 300 },
  { name: 'Dr. Priya S', speciality: 'Dermatologist', experience: 6, fee: 400 },
  { name: 'Dr. Karthik R', speciality: 'Orthopaedic', experience: 12, fee: 600 },
  { name: 'Dr. Meena V', speciality: 'Paediatrician', experience: 9, fee: 350 },
  { name: 'Dr. Arun P', speciality: 'Neurologist', experience: 11, fee: 700 },
];

async function seedIfEmpty() {
  const doctorCount = await Doctor.countDocuments();
  if (doctorCount > 0) return false;

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const password = await bcrypt.hash(adminPassword, 10);
  await User.findOneAndUpdate(
    { email: 'admin@carepoint.com' },
    {
      name: 'CarePoint Admin',
      email: 'admin@carepoint.com',
      phone: '9999999999',
      password,
      role: 'admin',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  for (const d of DOCTORS) {
    await Doctor.findOneAndUpdate({ name: d.name }, d, { upsert: true });
  }

  console.log(`Seeded ${DOCTORS.length} doctors and admin user (admin@carepoint.com / Admin@123)`);
  return true;
}

module.exports = { seedIfEmpty, DOCTORS };
