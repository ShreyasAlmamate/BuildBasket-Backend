const homeControllers = require('../../controllers/home/homeControllers')
const pageController = require('../../controllers/home/pageController')
const priceHistoryController = require('../../controllers/home/priceHistoryController')
const router = require('express').Router()

router.get('/get-categorys',homeControllers.get_categorys)
router.get('/get-products',homeControllers.get_products)
router.get('/price-range-latest-product',homeControllers.price_range_product)
router.get('/query-products',homeControllers.query_products)
router.get('/product-details/:slug',homeControllers.product_details)
router.get('/product-by-id/:productId',homeControllers.get_product_by_id)

router.post('/customer/submit-review',homeControllers.submit_review)
router.get('/customer/get-reviews/:productId',homeControllers.get_reviews)

// Page data routes
router.get('/about-data', pageController.get_about_data)
router.get('/pricing-data', pageController.get_pricing_data)
router.get('/faq-data', pageController.get_faq_data)

// Price history routes
router.get('/price-history/:productId', priceHistoryController.get_price_history)
router.get('/products-with-prices', priceHistoryController.get_all_products_with_prices)
router.get('/price-history-filter-options', priceHistoryController.get_filter_options)
router.put('/update-price/:productId', priceHistoryController.update_price)
  

module.exports = router 