const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
} = require('../controller/product.controller');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;
