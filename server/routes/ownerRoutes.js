const express = require('express');
const { getDashboard, getOwnerRatings } = require('../controllers/ownerController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Only owners can open these routes
router.get('/dashboard', protect, allowRoles('owner'), getDashboard);
router.get('/ratings', protect, allowRoles('owner'), getOwnerRatings);

module.exports = router;
