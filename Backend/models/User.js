import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, default: 'admin' }
});

export default mongoose.model('User', UserSchema);