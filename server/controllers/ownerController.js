const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { getRatingStats } = require('../utils/ratingStats');

// Finds the store that belongs to the logged-in owner.
// We always search by req.user._id (from the token), never by an id sent by the client,
// so an owner can never see another owner's store.
function findOwnerStore(ownerId) {
  return Store.findOne({ ownerId });
}

// GET /api/owner/dashboard
async function getDashboard(req, res) {
  try {
    const store = await findOwnerStore(req.user._id);
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to your account.' });
    }

    const stats = await getRatingStats([store._id]);
    const storeStats = stats[store._id.toString()] || { averageRating: 0, ratingCount: 0 };

    res.json({
      store: { id: store._id, name: store.name, address: store.address },
      averageRating: storeStats.averageRating,
      ratingCount: storeStats.ratingCount,
    });
  } catch (error) {
    console.error('Owner dashboard error:', error.message);
    res.status(500).json({ message: 'Could not load the dashboard.' });
  }
}

// GET /api/owner/ratings -> who rated my store and what they gave
async function getOwnerRatings(req, res) {
  try {
    const store = await findOwnerStore(req.user._id);
    if (!store) {
      return res.status(404).json({ message: 'No store is linked to your account.' });
    }

    const ratings = await Rating.find({ storeId: store._id })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    const result = ratings
      .filter((item) => item.userId)
      .map((item) => ({
        id: item._id,
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
