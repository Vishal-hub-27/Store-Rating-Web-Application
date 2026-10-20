// Allows only the given roles, e.g. allowRoles('owner')
// Must be used AFTER the protect middleware.
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not allowed to do this.' });
    }
    next();
  };
}

module.exports = { allowRoles };
