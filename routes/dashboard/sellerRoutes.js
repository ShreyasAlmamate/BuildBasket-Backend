const sellerController = require('../../controllers/dasboard/sellerController') 
const sellerFeaturesController = require('../../controllers/dasboard/sellerFeaturesController')
const { authMiddleware, isSeller } = require('../../middlewares/authMiddleware')
const router = require('express').Router()

// Admin routes for seller management
router.get('/request-seller-get',authMiddleware, sellerController.request_seller_get)  
router.get('/get-seller/:sellerId',authMiddleware, sellerController.get_seller)  
router.post('/seller-status-update',authMiddleware, sellerController.seller_status_update) 

router.get('/get-sellers',authMiddleware, sellerController.get_active_sellers) 
router.get('/get-deactive-sellers',authMiddleware, sellerController.get_deactive_sellers) 

// Seller feature routes (for sellers only)
router.get('/regions', isSeller, sellerFeaturesController.get_seller_regions);
router.post('/regions', isSeller, sellerFeaturesController.add_seller_region);
router.delete('/regions/:region', isSeller, sellerFeaturesController.remove_seller_region);
router.put('/regions/:region/fare', isSeller, sellerFeaturesController.update_region_fare);

router.put('/gst-rate', isSeller, sellerFeaturesController.update_gst_rate);

router.get('/wallet', isSeller, sellerFeaturesController.get_seller_wallet);
router.put('/payment-method', isSeller, sellerFeaturesController.update_payment_method);

router.get('/analytics', isSeller, sellerFeaturesController.get_seller_analytics);

router.get('/orders', isSeller, sellerFeaturesController.get_seller_orders);
router.put('/orders/:orderId/status', isSeller, sellerFeaturesController.update_order_status);
router.post('/orders/:orderId/invoice', isSeller, sellerFeaturesController.upload_delivery_invoice);

module.exports = router