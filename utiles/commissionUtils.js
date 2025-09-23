const commissionModel = require('../models/commissionModel');

// Calculate commission for a given base price
const calculateCommission = async (basePrice) => {
    try {
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
        
        return {
            basePrice,
            commissionAmount,
            finalPrice,
            commissionType: commission.commissionType
        };
    } catch (error) {
        console.log('Error calculating commission:', error.message);
        // Return default values on error
        return {
            basePrice,
            commissionAmount: 20, // Default ₹20
            finalPrice: basePrice + 20,
            commissionType: 'fixed'
        };
    }
};

// Calculate commission synchronously (for cases where async is not needed)
const calculateCommissionSync = (basePrice, commissionSettings = null) => {
    let commissionAmount = 0;
    
    if (commissionSettings) {
        if (commissionSettings.commissionType === 'fixed') {
            commissionAmount = commissionSettings.fixedAmount;
        } else {
            commissionAmount = (basePrice * commissionSettings.percentageAmount) / 100;
        }
    } else {
        // Default commission
        commissionAmount = 20;
    }
    
    const finalPrice = basePrice + commissionAmount;
    
    return {
        basePrice,
        commissionAmount,
        finalPrice,
        commissionType: commissionSettings?.commissionType || 'fixed'
    };
};

module.exports = {
    calculateCommission,
    calculateCommissionSync
};
