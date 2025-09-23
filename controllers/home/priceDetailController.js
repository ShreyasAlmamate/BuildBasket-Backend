const priceDetailModel = require('../../models/priceDetailModel');
const productModel = require('../../models/productModel');
const { responseReturn } = require("../../utiles/response");

class priceDetailController {
    get_price_details = async (req, res) => {
        try {
            const { productId } = req.params;
            
            let priceDetail = await priceDetailModel.findOne({ productId }).populate('productId');
            
            if (!priceDetail) {
                // Create default price detail if not exists
                const product = await productModel.findById(productId);
                if (!product) {
                    return responseReturn(res, 404, { message: 'Product not found' });
                }

                // Generate sample price history
                const priceHistory = [];
                const basePrice = product.price;
                const currentDate = new Date();
                
                for (let i = 30; i >= 0; i--) {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() - i);
                    
                    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
                    const price = Math.round(basePrice * (1 + variation));
                    const change = i === 0 ? 0 : price - (priceHistory[priceHistory.length - 1]?.price || basePrice);
                    const changePercent = i === 0 ? 0 : ((change / (priceHistory[priceHistory.length - 1]?.price || basePrice)) * 100);
                    
                    priceHistory.push({
                        price,
                        date,
                        change,
                        changePercent: Math.round(changePercent * 100) / 100
                    });
                }

                const currentPrice = priceHistory[priceHistory.length - 1].price;
                const weeklyChange = currentPrice - priceHistory[priceHistory.length - 7].price;
                const monthlyChange = currentPrice - priceHistory[0].price;
                
                priceDetail = await priceDetailModel.create({
                    productId,
                    currentPrice,
                    priceHistory,
                    marketTrend: weeklyChange > 0 ? 'up' : weeklyChange < 0 ? 'down' : 'stable',
                    priceRange: {
                        min: Math.min(...priceHistory.map(p => p.price)),
                        max: Math.max(...priceHistory.map(p => p.price))
                    },
                    weeklyChange,
                    monthlyChange
                });
            }

            responseReturn(res, 200, { priceDetail });
        } catch (error) {
            console.log('Price Detail Error:', error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    }

    update_price = async (req, res) => {
        try {
            const { productId } = req.params;
            const { newPrice } = req.body;

            const priceDetail = await priceDetailModel.findOne({ productId });
            if (!priceDetail) {
                return responseReturn(res, 404, { message: 'Price detail not found' });
            }

            const oldPrice = priceDetail.currentPrice;
            const change = newPrice - oldPrice;
            const changePercent = (change / oldPrice) * 100;

            // Add new price to history
            priceDetail.priceHistory.push({
                price: newPrice,
                date: new Date(),
                change,
                changePercent: Math.round(changePercent * 100) / 100
            });

            // Keep only last 30 days of history
            if (priceDetail.priceHistory.length > 30) {
                priceDetail.priceHistory = priceDetail.priceHistory.slice(-30);
            }

            priceDetail.currentPrice = newPrice;
            priceDetail.lastUpdated = new Date();

            // Update weekly and monthly changes
            if (priceDetail.priceHistory.length >= 7) {
                priceDetail.weeklyChange = newPrice - priceDetail.priceHistory[priceDetail.priceHistory.length - 7].price;
            }
            if (priceDetail.priceHistory.length >= 30) {
                priceDetail.monthlyChange = newPrice - priceDetail.priceHistory[0].price;
            }

            // Update market trend
            priceDetail.marketTrend = priceDetail.weeklyChange > 0 ? 'up' : priceDetail.weeklyChange < 0 ? 'down' : 'stable';

            // Update price range
            const prices = priceDetail.priceHistory.map(p => p.price);
            priceDetail.priceRange = {
                min: Math.min(...prices),
                max: Math.max(...prices)
            };

            await priceDetail.save();

            responseReturn(res, 200, { message: 'Price updated successfully', priceDetail });
        } catch (error) {
            console.log('Update Price Error:', error.message);
            responseReturn(res, 500, { message: 'Internal server error' });
        }
    }
}

module.exports = new priceDetailController();
