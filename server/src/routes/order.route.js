const express = require('express');
const router = express.Router();

const { verifyJWT } = require('../middleware/auth.middleware');
const { createOrder, getUserOrders } = require('../controller/order.controller');

// Orders for logged-in users
router.post('/orders', verifyJWT, createOrder);
router.get('/orders', verifyJWT, getUserOrders);

module.exports = router;

