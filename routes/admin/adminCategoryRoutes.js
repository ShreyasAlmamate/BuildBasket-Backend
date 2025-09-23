const adminCategoryController = require('../../controllers/admin/adminCategoryController') 
const { adminMiddleware } = require('../../middlewares/adminMiddleware')
const router = require('express').Router()

// Admin-only category routes
router.post('/admin/category-add', adminMiddleware, adminCategoryController.add_category) 
router.get('/admin/category-get', adminMiddleware, adminCategoryController.get_category) 
router.get('/admin/category-get/:id', adminMiddleware, adminCategoryController.get_category_by_id)
router.put('/admin/category-update/:id', adminMiddleware, adminCategoryController.update_category) 
router.delete('/admin/category-delete/:id', adminMiddleware, adminCategoryController.deleteCategory) 

module.exports = router
