import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected. MONGO_URI:', process.env.MONGO_URI);

const user = await User.findOne({ email: 'admin@namhyafoods.com' });
console.log('User found:', user ? 'YES' : 'NO');

if (user) {
  console.log('passwordHash exists:', user.passwordHash ? 'YES' : 'NO');
  console.log('passwordHash length:', user.passwordHash ? user.passwordHash.length : 0);
  const match = await bcrypt.compare('namhya2026', user.passwordHash);
  console.log('Password match:', match ? 'YES' : 'NO');
  console.log('role:', user.role);
} else {
  // List all users
  const all = await User.find({}).lean();
  console.log('All users in DB:', JSON.stringify(all.map(u => ({ email: u.email }))));
}

await mongoose.disconnect();
