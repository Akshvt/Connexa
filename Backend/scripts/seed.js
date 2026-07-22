import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const ADMIN_EMAIL = 'admin@namhyafoods.com';
const ADMIN_PASSWORD = 'namhya2026';
const SALT_ROUNDS = 10;

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI is not set in your .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(`Admin user '${ADMIN_EMAIL}' already exists. Skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    await User.create({ email: ADMIN_EMAIL, passwordHash, role: 'admin' });
    console.log('Admin user created.');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
