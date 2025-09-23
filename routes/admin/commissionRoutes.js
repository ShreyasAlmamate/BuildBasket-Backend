const express = require('express');
const router = express.Router();
const commissionController = require('../../controllers/admin/commissionController');
const { adminMiddleware } = require('../../middlewares/adminMiddleware');

// Get commission settings
router.get('/settings', adminMiddleware, commissionController.get_commission_settings);

// Update commission settings
router.put('/settings', adminMiddleware, commissionController.update_commission_settings);

// Calculate commission
router.post('/calculate', adminMiddleware, commissionController.calculate_commission);

// Get commission history
router.get('/history', adminMiddleware, commissionController.get_commission_history);

module.exports = router;
