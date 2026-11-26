require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const { seedIfEmpty } = require('./seedData');

async function main() {
  if (config.isProd && !config.jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required in production.');
  }
  if (!config.isProd && !config.jwtSecret) {
    console.warn('WARNING: JWT_SECRET is not set - using an insecure default for development only.');
  }

  await connectDB();
  await seedIfEmpty();

  const app = express();
  app.set('trust proxy', 1);
  app.use(cors({ origin: config.clientOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', authRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);

  // In production, serve the built React app from the same origin when present.
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  const serveClient = fs.existsSync(path.join(clientDist, 'index.html'));
  if (serveClient) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('Serving client build from', clientDist);
  }

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  });

  app.listen(config.port, () => {
    console.log(`CarePoint API running on http://localhost:${config.port}`);
    if (config.isProd) console.log('Environment: production');
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
