const express = require('express');
const { getStores, getStoreById, createStore, updateStore } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getStores);
router.post('/', protect, allowRoles('owner'), createStore); // owner adds a store
router.get('/:id', protect, getStoreById);
router.put('/:id', protect, allowRoles('owner'), updateStore); // owner edits own store

module.exports = router;