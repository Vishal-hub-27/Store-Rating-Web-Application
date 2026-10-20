const mongoose = require('mongoose');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { getRatingStats } = require('../utils/ratingStats');
const { validateAddress, validateStoreName, validateStoreDescription } = require('../utils/validators');

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

// Checks the store form fields and returns a list of error messages
function validateStoreInput(body) {
  return [
    validateStoreName(body.name),
    validateAddress(body.address),
    validateStoreDescription(body.description),
  ].filter(Boolean);
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

// GET /api/stores/:id  -> store details + everyone's ratings (the details page)
async function getStoreById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid store id.' });
    }
    const store = await Store.findById(req.params.id).populate('ownerId', 'name');
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Is the logged-in person the owner of THIS store?
    const isOwner = req.user.role === 'owner' && !!store.ownerId && store.ownerId._id.equals(req.user._id);

    const [info] = await addRatingInfo([store], req.user._id);
    const ratings = await Rating.find({ storeId: store._id })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      store: {
        ...info,
        description: store.description,
        ownerName: store.ownerId ? store.ownerId.name : '',
        isOwner,
      },
      ratings: ratings
        .filter((item) => item.userId)
        .map((item) => ({
          id: item._id,
          userName: item.userId.name,
          // Only the store's own owner may see the raters' emails
          ...(isOwner ? { userEmail: item.userId.email } : {}),
          rating: item.rating,
          updatedAt: item.updatedAt,
        })),
    });
  } catch (error) {
    console.error('Get store error:', error.message);
    res.status(500).json({ message: 'Could not load the store.' });
  }
}

// POST /api/stores  (owners only) -> add a new store owned by the logged-in owner
async function createStore(req, res) {
  try {
    const errors = validateStoreInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const { name, address, description } = req.body;
    // ownerId comes from the token, never from the request body
    const store = await Store.create({ name, address, description: description || '', ownerId: req.user._id });

    res.status(201).json({
      message: 'Store added successfully.',
      store: { id: store._id, name: store.name, address: store.address, description: store.description },
    });
  } catch (error) {
    console.error('Create store error:', error.message);
    res.status(500).json({ message: 'Could not add the store.' });
  }
}

// PUT /api/stores/:id  (owners only) -> edit the information of MY store
async function updateStore(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid store id.' });
    }
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }
    // An owner may edit only a store that belongs to them
    if (!store.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own store.' });
    }

    const errors = validateStoreInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    store.name = req.body.name;
    store.address = req.body.address;
    store.description = req.body.description || '';
    await store.save();

    res.json({
      message: 'Store information updated.',
      store: { id: store._id, name: store.name, address: store.address, description: store.description },
    });
  } catch (error) {
    console.error('Update store error:', error.message);
    res.status(500).json({ message: 'Could not update the store.' });
  }
}

module.exports = { getStores, getStoreById, createStore, updateStore };