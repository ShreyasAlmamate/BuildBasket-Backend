const sellerModel = require('../models/sellerModel');

/**
 * Calculate order total with GST and region fare
 * @param {Array} products - Array of products with sellerId and price
 * @param {String} region - Delivery region
 * @returns {Object} - Calculated totals with breakdown
 */
const calculateOrderTotal = async (products, region = null) => {
    try {
        let totalAmount = 0;
        let totalGST = 0;
        let totalFare = 0;
        let breakdown = [];

        // Group products by seller
        const sellerGroups = {};
        products.forEach(product => {
            const sellerId = product.sellerId;
            if (!sellerGroups[sellerId]) {
                sellerGroups[sellerId] = [];
            }
            sellerGroups[sellerId].push(product);
        });

        // Calculate for each seller
        for (const [sellerId, sellerProducts] of Object.entries(sellerGroups)) {
            const seller = await sellerModel.findById(sellerId).select('gstRate regionFares');
            if (!seller) continue;

            const sellerTotal = sellerProducts.reduce((sum, product) => sum + (product.price || 0), 0);
            const gstRate = seller.gstRate || 18;
            const gstAmount = (sellerTotal * gstRate) / 100;
            
            // Calculate region fare if region is specified
            let regionFare = 0;
            if (region && seller.regionFares && seller.regionFares.length > 0) {
                const fareData = seller.regionFares.find(rf => rf.region === region);
                if (fareData) {
                    regionFare = fareData.fare;
                }
            }

            const sellerSubtotal = sellerTotal + gstAmount + regionFare;

            breakdown.push({
                sellerId,
                products: sellerProducts,
                subtotal: sellerTotal,
                gstRate,
                gstAmount,
                regionFare,
                total: sellerSubtotal
            });

            totalAmount += sellerSubtotal;
            totalGST += gstAmount;
            totalFare += regionFare;
        }

        return {
            success: true,
            totalAmount,
            totalGST,
            totalFare,
            breakdown,
            summary: {
                subtotal: totalAmount - totalGST - totalFare,
                gst: totalGST,
                fare: totalFare,
                total: totalAmount
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Calculate GST for a given amount and rate
 * @param {Number} amount - Base amount
 * @param {Number} gstRate - GST rate percentage
 * @returns {Object} - GST calculation breakdown
 */
const calculateGST = (amount, gstRate = 18) => {
    const gstAmount = (amount * gstRate) / 100;
    return {
        originalAmount: amount,
        gstRate,
        gstAmount,
        totalAmount: amount + gstAmount
    };
};

/**
 * Get region fare for a seller
 * @param {String} sellerId - Seller ID
 * @param {String} region - Region name
 * @returns {Number} - Fare amount
 */
const getRegionFare = async (sellerId, region) => {
    try {
        const seller = await sellerModel.findById(sellerId).select('regionFares');
        if (!seller || !seller.regionFares) return 0;

        const fareData = seller.regionFares.find(rf => rf.region === region);
        return fareData ? fareData.fare : 0;
    } catch (error) {
        return 0;
    }
};

module.exports = {
    calculateOrderTotal,
    calculateGST,
    getRegionFare
};
