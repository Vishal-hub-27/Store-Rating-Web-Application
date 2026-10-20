const mongoose = require('mongoose');

// Replaces the old MySQL `users` table.
// Passwords are hashed with bcryptjs in the controller BEFORE saving.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  address: { type: String, required: true, trim: true, maxlength: 400 },
  password: { type: String, required: true }, // bcrypt hash, never plain text
  role: { type: String, enum: ['user', 'owner'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
