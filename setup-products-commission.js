require('dotenv').config();
const { dbConnect } = require('./utiles/db');
const { updateAllProductsCommission } = require('./utiles/updateAllProductsCommission');

const setupProductsCommission = async () => {
    console.log('Setting up commission data for all existing products...');
    
    try {
        // Connect to database
        await dbConnect();
        console.log('Connected to database');
        
        // Update all products with current commission
        const result = await updateAllProductsCommission();
        
        if (result.success) {
            console.log('✅ Success!');
            console.log(`📊 Updated ${result.updatedCount} products`);
            console.log(`📝 Message: ${result.message}`);
            
            if (result.errors && result.errors.length > 0) {
                console.log(`⚠️  ${result.errors.length} errors encountered:`);
                result.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. Product ${error.productId}: ${error.error}`);
                });
            }
        } else {
            console.log('❌ Failed!');
            console.log(`📝 Error: ${result.message}`);
            if (result.error) {
                console.log(`🔍 Details: ${result.error}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        process.exit(0);
    }
};

setupProductsCommission();
