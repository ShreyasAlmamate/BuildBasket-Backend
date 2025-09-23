const adminProductController = require('../../controllers/admin/adminProductController') 
const { adminMiddleware } = require('../../middlewares/adminMiddleware')
const router = require('express').Router()

// Admin-only product routes
router.post('/admin/product-add', adminMiddleware, adminProductController.add_product)  
router.get('/admin/products-get', adminMiddleware, adminProductController.products_get)  
router.get('/admin/product-get/:productId', adminMiddleware, adminProductController.product_get)
router.post('/admin/product-update', adminMiddleware, adminProductController.product_update)  
router.post('/admin/product-image-update', adminMiddleware, adminProductController.product_image_update)   
router.delete('/admin/product-delete/:productId', adminMiddleware, adminProductController.product_delete)
router.get('/admin/sellers-get', adminMiddleware, adminProductController.get_sellers)

module.exports = router
