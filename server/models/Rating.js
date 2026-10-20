const mongoose = require('mongoose');

// Replaces the old `reviews` table (the star rating part only, no comments).
const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// One user can rate one store only once. MongoDB itself enforces this.
ratingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
