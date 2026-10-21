const mongoose = require('mongoose');


const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  },
  { timestamps: true } 
);


ratingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
