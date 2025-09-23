const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excel/excelController');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

// Excel import routes (Admin only)
router.post('/import/categories', adminMiddleware, excelController.uploadExcel, excelController.importCategories);
router.post('/import/products', adminMiddleware, excelController.uploadExcel, excelController.importProducts);
router.post('/import/sellers', adminMiddleware, excelController.uploadExcel, excelController.importSellers);
router.post('/import/customers', adminMiddleware, excelController.uploadExcel, excelController.importCustomers);
router.post('/import/banners', adminMiddleware, excelController.uploadExcel, excelController.importBanners);

// Get sample templates
router.get('/templates', excelController.getSampleTemplates);



module.exports = router;
