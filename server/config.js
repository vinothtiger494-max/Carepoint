require('dotenv').config();
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

// Comma-separated list of allowed front-end origins, e.g.
// CLIENT_URL=https://carepoint.example.com,https://www.carepoint.example.com
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = {
  isProd,
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  clientOrigins,
  mongoosePath: path.join(__dirname, 'node_modules', '.cache', 'mongoose'),
};
