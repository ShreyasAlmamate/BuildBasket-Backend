const express = require('express');
const { isSeller } = require('../../middlewares/authMiddleware');
const sellerFeaturesController = require('../../controllers/dasboard/sellerFeaturesController');

const router = express.Router();

// Region Management Routes
router.get('/regions', isSeller, sellerFeaturesController.get_seller_regions);
router.post('/regions', isSeller, sellerFeaturesController.add_seller_region);
router.delete('/regions/:region', isSeller, sellerFeaturesController.remove_seller_region);
router.put('/regions/:region/fare', isSeller, sellerFeaturesController.update_region_fare);

// GST Management Routes
router.put('/gst-rate', isSeller, sellerFeaturesController.update_gst_rate);

// Wallet Management Routes
router.get('/wallet', isSeller, sellerFeaturesController.get_seller_wallet);
router.put('/payment-method', isSeller, sellerFeaturesController.update_payment_method);

// Analytics Routes
router.get('/analytics', isSeller, sellerFeaturesController.get_seller_analytics);

// Order Management Routes
router.get('/orders', isSeller, sellerFeaturesController.get_seller_orders);
router.put('/orders/:orderId/status', isSeller, sellerFeaturesController.update_order_status);
router.post('/orders/:orderId/invoice', isSeller, sellerFeaturesController.upload_delivery_invoice);

// Test Customer Order Creation (for demonstration)
router.post('/test/create-order', sellerFeaturesController.create_test_customer_order);

module.exports = router;
