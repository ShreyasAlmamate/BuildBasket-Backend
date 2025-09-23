const express = require('express');
const router = express.Router();
const commissionController = require('../../controllers/home/commissionController');

// Get commission settings (public)
router.get('/settings', commissionController.get_commission_settings);

// Calculate commission (public)
router.post('/calculate', commissionController.calculate_commission);

module.exports = router;
