const express = require('express');
const router = express.Router();
const buyerController = require('../../controllers/admin/buyerController');
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

// Buyer management routes (Admin only)
router.get('/buyers', adminMiddleware, buyerController.get_buyers);
router.get('/buyers/stats', adminMiddleware, buyerController.get_buyer_stats);
router.get('/buyers/export', adminMiddleware, buyerController.export_buyers);
router.get('/buyers/:buyerId', adminMiddleware, buyerController.get_buyer);
router.post('/buyers', adminMiddleware, buyerController.create_buyer);
router.put('/buyers/:buyerId', adminMiddleware, buyerController.update_buyer);
router.delete('/buyers/:buyerId', adminMiddleware, buyerController.delete_buyer);

// Credit limit management routes
router.get('/credit-applications', adminMiddleware, buyerController.get_credit_applications);
router.put('/credit-applications/:buyerId/review', adminMiddleware, buyerController.review_credit_application);

// Excel import route
router.post('/buyers/import', adminMiddleware, upload.single('excelFile'), buyerController.import_buyers);

module.exports = router;
