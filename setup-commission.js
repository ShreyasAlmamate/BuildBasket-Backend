const { dbConnect } = require('./utiles/db');
const commissionModel = require('./models/commissionModel');

async function setupDefaultCommission() {
    try {
        console.log('Setting up default commission...');
        
        // Check if commission already exists
        const existingCommission = await commissionModel.findOne({ isActive: true });
        
        if (existingCommission) {
            console.log('Commission settings already exist:', existingCommission);
            return;
        }
        
        // Create default commission
        const defaultCommission = await commissionModel.create({
            commissionType: 'fixed',
            fixedAmount: 20,
            percentageAmount: 0,
            isActive: true,
            description: 'Platform commission - ₹20 per product'
        });
        
        console.log('Default commission created successfully:', defaultCommission);
        
    } catch (error) {
        console.error('Error setting up commission:', error);
    } finally {
        process.exit();
    }
}

// Connect to database and setup commission
dbConnect();
setupDefaultCommission();
