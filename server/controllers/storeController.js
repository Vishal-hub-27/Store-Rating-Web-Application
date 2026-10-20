const mongoose = require('mongoose');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { getRatingStats } = require('../utils/ratingStats');

// Makes user text safe to use inside a regular expression
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Adds averageRating, ratingCount and the logged-in user's own rating to each store
async function addRatingInfo(stores, userId) {
  const storeIds = stores.map((store) => store._id);
  const stats = await getRatingStats(storeIds);
  const myRatings = await Rating.find({ userId, storeId: { $in: storeIds } });

  return stores.map((store) => {
    const id = store._id.toString();
    const mine = myRatings.find((item) => item.storeId.toString() === id);
    return {
      id: store._id,
      name: store.name,
      address: store.address,
      averageRating: stats[id] ? stats[id].averageRating : 0,
      ratingCount: stats[id] ? stats[id].ratingCount : 0,
      myRating: mine ? mine.rating : null,
    };
  });
}

// GET /api/stores?search=electronics
async function getStores(req, res) {
  try {
    const filter = {};
    if (typeof req.query.search === 'string' && req.query.search.trim() !== '') {
      filter.name = { $regex: escapeRegex(req.query.search.trim()), $options: 'i' }; // case-insensitive
    }

    const stores = await Store.find(filter).sort({ name: 1 });
    const result = await addRatingInfo(stores, req.user._id);
    res.json({ stores: result });
  } catch (error) {
    console.error('Get stores error:', error.message);
    res.status(500).json({ message: 'Could not load stores.' });
  }
}

// GET /api/stores/:id
async function getStoreById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid store id.' });
    }
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    const [result] = await addRatingInfo([store], req.user._id);
    res.json({ store: result });
  } catch (error) {
    console.error('Get store error:', error.message);
    res.status(500).json({ message: 'Could not load the store.' });
  }
}

module.exports = { getStores, getStoreById };
