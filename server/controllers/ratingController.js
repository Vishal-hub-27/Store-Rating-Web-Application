const mongoose = require('mongoose');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { validateRating } = require('../utils/validators');
const { getRatingStats } = require('../utils/ratingStats');

// GET /api/ratings/my  -> all ratings submitted by the logged-in user
async function getMyRatings(req, res) {
  try {
    const ratings = await Rating.find({ userId: req.user._id }).populate('storeId', 'name address');
    const result = ratings
      .filter((item) => item.storeId) // skip ratings whose store was deleted
      .map((item) => ({
        storeId: item.storeId._id,
        storeName: item.storeId.name,
        rating: item.rating,
        updatedAt: item.updatedAt,
      }));
    res.json({ ratings: result });
  } catch (error) {
    console.error('Get my ratings error:', error.message);
    res.status(500).json({ message: 'Could not load your ratings.' });
  }
}

// PUT /api/ratings/:storeId  -> creates the rating the first time, updates it afterwards
async function saveRating(req, res) {
  try {
    const { storeId } = req.params;
    if (!mongoose.isValidObjectId(storeId)) {
      return res.status(400).json({ message: 'Invalid store id.' });
    }

    const rating = req.body.rating;
    const ratingError = validateRating(rating);
    if (ratingError) {
      return res.status(400).json({ message: ratingError });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // The filter uses the userId from the TOKEN (req.user), so a user can only touch their own rating.
    // upsert: true = create if it does not exist, update if it does.
    await Rating.findOneAndUpdate(
      { userId: req.user._id, storeId: store._id },
      { rating },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    );

    // Send back the fresh average so the page can show it immediately
    const stats = await getRatingStats([store._id]);
    const storeStats = stats[store._id.toString()] || { averageRating: 0, ratingCount: 0 };

    res.json({
      message: 'Your rating has been saved.',
      myRating: rating,
      averageRating: storeStats.averageRating,
      ratingCount: storeStats.ratingCount,
    });
  } catch (error) {
    if (error.code === 11000) {
      
      return res.status(409).json({ message: 'You have already rated this store. Please try again.' });
    }
    console.error('Save rating error:', error.message);
    res.status(500).json({ message: 'Could not save your rating.' });
  }
}

module.exports = { getMyRatings, saveRating };
