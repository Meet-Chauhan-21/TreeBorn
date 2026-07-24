const express = require('express');
const router = express.Router();
const webhookController = require('../controller/webhook.controller');

// Post Shiprocket webhook updates
router.post('/shiprocket', webhookController.handleShiprocketWebhook);

module.exports = router;
