const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks the JWT token sent in the "Authorization: Bearer <token>" header
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Please log in to continue.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user from the database so a deleted user cannot keep using an old token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws when the token is invalid or expired
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = { protect };
