const express = require('express');
const router = express.Router();
const reportsController = require('../../controllers/admin/reportsController');
const { adminMiddleware } = require('../../middlewares/adminMiddleware');

// Reports and exports routes (Admin only)
router.get('/reports/stats', adminMiddleware, reportsController.get_report_stats);
router.get('/reports/export/sellers', adminMiddleware, reportsController.export_sellers_report);
router.get('/reports/export/buyers', adminMiddleware, reportsController.export_buyers_report);
router.get('/reports/export/transactions', adminMiddleware, reportsController.export_transactions_report);
router.get('/reports/export/credit', adminMiddleware, reportsController.export_credit_report);
router.get('/reports/export/commodities', adminMiddleware, reportsController.export_commodities_report);
router.get('/reports/export/analytics', adminMiddleware, reportsController.export_analytics_report);

module.exports = router;
