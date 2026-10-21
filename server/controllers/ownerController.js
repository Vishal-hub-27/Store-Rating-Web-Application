const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { getRatingStats } = require('../utils/ratingStats');


async function getDashboard(req, res) {
  try {
    const stores = await Store.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    const stats = await getRatingStats(stores.map((store) => store._id));

    const list = stores.map((store) => {
      const storeStats = stats[store._id.toString()] || { averageRating: 0, ratingCount: 0 };
      return {
        id: store._id,
        name: store.name,
        address: store.address,
        averageRating: storeStats.averageRating,
        ratingCount: storeStats.ratingCount,
      };
    });
    const totalRatings = list.reduce((sum, store) => sum + store.ratingCount, 0);

    res.json({ stores: list, totalStores: list.length, totalRatings });
  } catch (error) {
    console.error('Owner dashboard error:', error.message);
    res.status(500).json({ message: 'Could not load the dashboard.' });
  }
}

// GET /api/owner/ratings -> who rated any of my stores and what they gave
async function getOwnerRatings(req, res) {
  try {
    const stores = await Store.find({ ownerId: req.user._id });
    const ratings = await Rating.find({ storeId: { $in: stores.map((store) => store._id) } })
      .populate('userId', 'name email')
      .populate('storeId', 'name')
      .sort({ updatedAt: -1 });

    const result = ratings
      .filter((item) => item.userId && item.storeId)
      .map((item) => ({
        id: item._id,
        storeId: item.storeId._id,
        storeName: item.storeId.name,
        userName: item.userId.name,
        userEmail: item.userId.email,
        rating: item.rating,
        updatedAt: item.updatedAt,
      }));

    res.json({ ratings: result });
  } catch (error) {
    console.error('Owner ratings error:', error.message);
    res.status(500).json({ message: 'Could not load ratings.' });
  }
}

module.exports = { getDashboard, getOwnerRatings };
