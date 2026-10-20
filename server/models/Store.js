const mongoose = require('mongoose');

// Replaces the old `listings` table. ownerId works like the old listings.user_id foreign key.
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  address: { type: String, required: true, trim: true, maxlength: 400 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Store', storeSchema);
