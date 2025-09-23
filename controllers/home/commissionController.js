const commissionModel = require('../../models/commissionModel');
const { responseReturn } = require('../../utiles/response');

class commissionController {
    // Get current commission settings (public endpoint)
    get_commission_settings = async (req, res) => {
        try {
            let commission = await commissionModel.findOne({ isActive: true });
            
            if (!commission) {
                // Return default commission if none exists
                commission = {
                    commissionType: 'fixed',
                    fixedAmount: 20,
                    percentageAmount: 0,
                    isActive: true,
                    description: 'Platform commission'
                };
            }
            
            responseReturn(res, 200, { success: true, commission });
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, { error: error.message });
        }
    };

    // Calculate commission for a given price (public endpoint)
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
}

module.exports = new commissionController();
