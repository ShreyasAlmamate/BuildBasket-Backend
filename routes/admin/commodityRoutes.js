const express = require('express');
const router = express.Router();
const commodityController = require('../../controllers/admin/commodityController');
const { adminMiddleware } = require('../../middlewares/adminMiddleware');
const multer = require('multer');

// Configure multer for Excel file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.xlsx', '.xls'];
        const ext = require('path').extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Commodity management routes (Admin only)
router.get('/commodities', adminMiddleware, commodityController.get_commodities);
router.get('/commodities/stats', adminMiddleware, commodityController.get_commodity_stats);
router.get('/commodities/export', adminMiddleware, commodityController.export_commodities);
router.get('/commodities/:commodityId', adminMiddleware, commodityController.get_commodity);
router.post('/commodities', adminMiddleware, commodityController.create_commodity);
router.put('/commodities/:commodityId', adminMiddleware, commodityController.update_commodity);
router.delete('/commodities/:commodityId', adminMiddleware, commodityController.delete_commodity);

// Excel import route
router.post('/commodities/import', adminMiddleware, upload.single('excelFile'), commodityController.import_commodities);

module.exports = router;
