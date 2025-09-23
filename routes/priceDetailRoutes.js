const express = require('express');
const router = express.Router();
const priceDetailController = require('../controllers/home/priceDetailController');

router.get('/price-details/:productId', priceDetailController.get_price_details);
router.put('/update-price/:productId', priceDetailController.update_price);

module.exports = router;
