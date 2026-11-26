require('dotenv').config();
const { connectDB } = require('../db');
const { seedIfEmpty } = require('../seedData');

async function seed() {
  await connectDB();
  const seeded = await seedIfEmpty();
  if (!seeded) console.log('Database already seeded - nothing to do.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
