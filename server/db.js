const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('./config');

// If a MongoDB binary is bundled with the project, use it instead of
// downloading one at runtime (development convenience only).
const bundledMongod = path.join(
  __dirname,
  'mongodb-bin',
  'mongodb-win32-x86_64-windows-7.0.24',
  'bin',
  'mongod.exe'
);
if (!process.env.MONGOMS_SYSTEM_BINARY && fs.existsSync(bundledMongod)) {
  process.env.MONGOMS_SYSTEM_BINARY = bundledMongod;
}

async function connectDB() {
  let uri = config.mongoUri;
  let memoryServer = null;

  const useMemory = !uri || uri === 'memory';

  if (useMemory) {
    if (config.isProd) {
      throw new Error(
        'MONGO_URI is required in production. In-memory MongoDB is for local development only.'
      );
    }
    console.log('MONGO_URI not set - starting in-memory MongoDB...');
    memoryServer = await MongoMemoryServer.create({
      instance: { dbPath: config.mongoosePath },
    });
    uri = memoryServer.getUri('carepoint');
    console.log('In-memory MongoDB ready.');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.host || 'memory');
  return { mongoose, memoryServer };
}

module.exports = { connectDB };
