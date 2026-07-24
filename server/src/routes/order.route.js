const express = require('express');
const router = express.Router();

const { verifyJWT } = require('../middleware/auth.middleware');
const { createOrder, getUserOrders, createRazorpayOrder } = require('../controller/order.controller');

// Orders for logged-in users
router.post('/orders/razorpay-create', verifyJWT, createRazorpayOrder);
router.post('/orders', verifyJWT, createOrder);
router.get('/orders', verifyJWT, getUserOrders);

module.exports = router;

