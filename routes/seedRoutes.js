const express = require('express');
const router = express.Router();
const seedData = require('../seeders/seedData');

// Temporary endpoint to seed database (REMOVE AFTER SEEDING)
router.post('/seed-database', async (req, res) => {
    try {
        console.log('🌱 Starting database seeding via API...');
        await seedData();
        res.json({ 
            success: true, 
            message: 'Database seeded successfully!',
            accounts: {
                admin: 'admin@buildbasket.com / admin123',
                sellers: [
                    'seller@buildbasket.com / seller123',
                    'steelhub@buildbasket.com / steel123',
                    'electrical@buildbasket.com / electrical123',
                    'plumbing@buildbasket.com / plumbing123'
                ],
                customers: [
                    'customer@buildbasket.com / customer123',
                    'john@buildbasket.com / john123',
                    'sarah@buildbasket.com / sarah123',
                    'mike@buildbasket.com / mike123'
                ]
            }
        });
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
