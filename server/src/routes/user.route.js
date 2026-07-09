const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress
} = require('../controller/user.controller');
const { verifyJWT, authorizeRoles } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser); // Clear cookie and invalidate session

// Protected routes (User & Admin)
router.get('/profile', verifyJWT, getUserProfile);
router.put('/profile', verifyJWT, updateUserProfile);

// Address CRUD routes
router.post('/addresses', verifyJWT, addUserAddress);
router.put('/addresses/:addressId', verifyJWT, updateUserAddress);
router.delete('/addresses/:addressId', verifyJWT, deleteUserAddress);

// Admin-only test route
router.get('/admin-only', verifyJWT, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    message: 'Welcome Admin! You have access to this restricted admin resource.',
    admin: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = router;
