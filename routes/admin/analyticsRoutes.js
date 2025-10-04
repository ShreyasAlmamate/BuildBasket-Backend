const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/admin/analyticsController');
const { adminMiddleware } = require('../../middlewares/adminMiddleware');

// Analytics routes (Admin only)
router.get('/analytics', adminMiddleware, analyticsController.get_analytics);

module.exports = router;
