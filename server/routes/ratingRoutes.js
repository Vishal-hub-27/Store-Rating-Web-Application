const express = require('express');
const { getMyRatings, saveRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Only normal users can rate stores
router.get('/my', protect, allowRoles('user'), getMyRatings);
router.put('/:storeId', protect, allowRoles('user'), saveRating);

module.exports = router;
