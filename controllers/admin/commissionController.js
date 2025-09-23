const commissionModel = require('../../models/commissionModel');
const { responseReturn } = require('../../utiles/response');
const { updateAllProductsCommission } = require('../../utiles/updateAllProductsCommission');

class commissionController {
    // Get current commission settings
    get_commission_settings = async (req, res) => {
        try {
            let commission = await commissionModel.findOne({ isActive: true });
            
            if (!commission) {
                // Create default commission if none exists
                commission = await commissionModel.create({
                    commissionType: 'fixed',
                    fixedAmount: 20,
                    isActive: true,
                    description: 'Platform commission'
                });
            }
            
            responseReturn(res, 200, { success: true, commission });
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, { error: error.message });
        }
    };

    // Update commission settings
    update_commission_settings = async (req, res) => {
        try {
            console.log('🔧 Commission update request received');
            console.log('📊 Request body:', req.body);
            console.log('🔑 User role:', req.role);
            console.log('🆔 User ID:', req.id);
            
            const { commissionType, fixedAmount, percentageAmount, description } = req.body;
            
            // Validate input
            if (commissionType === 'fixed' && (fixedAmount === undefined || fixedAmount === null || fixedAmount < 0)) {
                return responseReturn(res, 400, { success: false, error: 'Fixed amount must be a non-negative number' });
            }
            
            if (commissionType === 'percentage' && (percentageAmount === undefined || percentageAmount === null || percentageAmount < 0 || percentageAmount > 100)) {
                return responseReturn(res, 400, { success: false, error: 'Percentage amount must be between 0 and 100' });
            }
            
            // Deactivate current commission
            await commissionModel.updateMany({ isActive: true }, { isActive: false });
            
            // Create new commission
            const newCommission = await commissionModel.create({
                commissionType,
                fixedAmount: commissionType === 'fixed' ? fixedAmount : 0,
                percentageAmount: commissionType === 'percentage' ? percentageAmount : 0,
                isActive: true,
                description: description || 'Platform commission',
                lastUpdated: new Date()
            });
            
            // Update all products with new commission
            console.log('Updating all products with new commission...');
            const updateResult = await updateAllProductsCommission();
            
            if (updateResult.success) {
                console.log(`Products update result: ${updateResult.message}`);
            } else {
                console.error(`Products update failed: ${updateResult.message}`);
            }
            
            // Broadcast commission update to all connected clients
            if (global.io) {
                global.io.emit('commission_changed', {
                    commission: newCommission,
                    message: 'Commission settings have been updated',
                    productsUpdated: updateResult.updatedCount || 0
                });
                console.log('Commission update broadcasted to all clients');
            }
            
            responseReturn(res, 200, { 
                success: true,
                message: 'Commission settings updated successfully', 
                commission: newCommission,
                productsUpdate: updateResult
            });
        } catch (error) {
            console.log('❌ Commission update error:', error.message);
            responseReturn(res, 500, { success: false, error: error.message });
        }
    };

    // Calculate commission for a given price
    calculate_commission = async (req, res) => {
        try {
            const { basePrice } = req.body;
            
            if (!basePrice || basePrice < 0) {
                return responseReturn(res, 400, { error: 'Base price must be a positive number' });
            }
            
            let commission = await commissionModel.findOne({ isActive: true });
            
            if (!commission) {
                // Use default commission if none exists
                commission = {
                    commissionType: 'fixed',
                    fixedAmount: 20,
                    percentageAmount: 0
                };
            }
            
            let commissionAmount = 0;
            if (commission.commissionType === 'fixed') {
                commissionAmount = commission.fixedAmount;
            } else {
                commissionAmount = (basePrice * commission.percentageAmount) / 100;
            }
            
            const finalPrice = basePrice + commissionAmount;
            
            responseReturn(res, 200, {
                success: true,
                basePrice,
                commissionAmount,
                finalPrice,
                commissionType: commission.commissionType
            });
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, { error: error.message });
        }
    };

    // Get commission history
    get_commission_history = async (req, res) => {
        try {
            const commissions = await commissionModel.find().sort({ createdAt: -1 });
            responseReturn(res, 200, { success: true, commissions });
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, { error: error.message });
        }
    };
}

module.exports = new commissionController();
