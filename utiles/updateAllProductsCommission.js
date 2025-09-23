const productModel = require('../models/productModel');
const commissionModel = require('../models/commissionModel');

/**
 * Update commission for all products in the database
 * This function is called when commission settings are changed
 */
const updateAllProductsCommission = async () => {
    try {
        console.log('Starting to update commission for all products...');
        
        // Get the current active commission settings
        const commission = await commissionModel.findOne({ isActive: true });
        
        if (!commission) {
            console.warn('No active commission found. Using default commission.');
            return { success: false, message: 'No active commission found' };
        }
        
        // Get all active products
        const products = await productModel.find({ status: 'active' });
        console.log(`Found ${products.length} products to update`);
        
        let updatedCount = 0;
        let errors = [];
        
        // Update each product
        for (const product of products) {
            try {
                // Calculate commission for this product
                let commissionAmount = 0;
                if (commission.commissionType === 'fixed') {
                    commissionAmount = commission.fixedAmount;
                } else if (commission.commissionType === 'percentage') {
                    commissionAmount = (product.price * commission.percentageAmount) / 100;
                }
                
                const finalPrice = product.price + commissionAmount;
                
                // Update the product with new commission data
                await productModel.findByIdAndUpdate(product._id, {
                    finalPrice: finalPrice,
                    commissionAmount: commissionAmount,
                    commissionType: commission.commissionType,
                    lastCommissionUpdate: new Date()
                });
                
                updatedCount++;
                
                // Log progress for every 100 products
                if (updatedCount % 100 === 0) {
                    console.log(`Updated ${updatedCount}/${products.length} products`);
                }
                
            } catch (error) {
                console.error(`Error updating product ${product._id}:`, error.message);
                errors.push({
                    productId: product._id,
                    error: error.message
                });
            }
        }
        
        console.log(`Commission update completed. Updated ${updatedCount}/${products.length} products`);
        
        if (errors.length > 0) {
            console.warn(`Encountered ${errors.length} errors during update`);
            return {
                success: true,
                message: `Updated ${updatedCount} products with ${errors.length} errors`,
                updatedCount,
                totalProducts: products.length,
                errors
            };
        }
        
        return {
            success: true,
            message: `Successfully updated ${updatedCount} products`,
            updatedCount,
            totalProducts: products.length
        };
        
    } catch (error) {
        console.error('Error in updateAllProductsCommission:', error);
        return {
            success: false,
            message: 'Failed to update products commission',
            error: error.message
        };
    }
};

/**
 * Update commission for a single product
 * This function is used when adding/updating individual products
 */
const updateSingleProductCommission = async (productId, productPrice) => {
    try {
        const commission = await commissionModel.findOne({ isActive: true });
        
        if (!commission) {
            console.warn('No active commission found for product update');
            return { success: false, message: 'No active commission found' };
        }
        
        // Calculate commission
        let commissionAmount = 0;
        if (commission.commissionType === 'fixed') {
            commissionAmount = commission.fixedAmount;
        } else if (commission.commissionType === 'percentage') {
            commissionAmount = (productPrice * commission.percentageAmount) / 100;
        }
        
        const finalPrice = productPrice + commissionAmount;
        
        // Update the product
        await productModel.findByIdAndUpdate(productId, {
            finalPrice: finalPrice,
            commissionAmount: commissionAmount,
            commissionType: commission.commissionType,
            lastCommissionUpdate: new Date()
        });
        
        return {
            success: true,
            finalPrice,
            commissionAmount,
            commissionType: commission.commissionType
        };
        
    } catch (error) {
        console.error('Error in updateSingleProductCommission:', error);
        return {
            success: false,
            message: 'Failed to update product commission',
            error: error.message
        };
    }
};

module.exports = {
    updateAllProductsCommission,
    updateSingleProductCommission
};
