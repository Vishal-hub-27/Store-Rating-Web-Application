const express = require('express');
const { getStores, getStoreById } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getStores);
router.get('/:id', protect, getStoreById);

module.exports = router;
