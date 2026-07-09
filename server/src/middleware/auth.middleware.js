const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to verify access token (JWT)
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized. Access token is missing or invalid.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Access token is missing.' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized. User does not exist.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

// Middleware to check user role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  verifyJWT,
  authorizeRoles
};
