const priceHistoryModel = require('../../models/priceHistoryModel');
const productModel = require('../../models/productModel');
const { responseReturn } = require("../../utiles/response");

class priceHistoryController {
    // Get price history for a specific product
    get_price_history = async (req, res) => {
        try {
            const { productId } = req.params;
            const { period = '1M', state, city, region, category } = req.query; // 7D, 1M, 3M, 6M, 1Y
            
            // Build filter object
            let filter = { productId };
            
            // Add location and category filters if provided
            if (state) filter['location.state'] = state;
            if (city) filter['location.city'] = city;
            if (region) filter['location.region'] = region;
            if (category) filter['category'] = category;
            
            let priceHistory = await priceHistoryModel.findOne(filter).populate('productId');
            
            if (!priceHistory) {
                // Create default price history if not exists
                const product = await productModel.findById(productId);
                if (!product) {
                    return responseReturn(res, 404, { message: 'Product not found' });
                }

                priceHistory = await this.createDefaultPriceHistory(product);
            }

            // Filter data based on period
            const filteredData = this.filterDataByPeriod(priceHistory.priceHistory, period);
            
            // Calculate additional metrics
            const metrics = this.calculateMetrics(filteredData, priceHistory.currentPrice);

            // Flatten metrics into priceHistory object for frontend compatibility
            const phObj = priceHistory.toObject();
            // Ensure priceRange is always present
            const safePriceRange = phObj.priceRange && typeof phObj.priceRange === 'object'
                ? phObj.priceRange
                : { min: 0, max: 0, avg: 0 };
            responseReturn(res, 200, {
                success: true,
                priceHistory: {
                    priceHistory: filteredData,
                    currentPrice: phObj.currentPrice,
                    marketTrend: phObj.marketTrend,
                    changes: phObj.changes,
                    priceRange: safePriceRange,
                    marketIndicators: phObj.marketIndicators,
                    ...metrics // add metrics if needed
                }
            });

        } catch (error) {
            console.error('Error fetching price history:', error);
            responseReturn(res, 500, { message: 'Error fetching price history', error: error.message });
        }
    };

    // Create default price history for a product
    createDefaultPriceHistory = async (product) => {
        const priceHistory = [];
        const currentDate = new Date();
        const basePrice = product.price;
        
        // Generate price data at specific intervals for different time periods
        // 7 days: 7 data points (daily)
        // 1 month: Every 5 days (6 data points)
        // 3 months: Every 7 days (13 data points)
        // 6 months: Every 9 days (20 data points)
        // 1 year: Every 11 days (33 data points)
        
        const intervals = [
            // 7 days - daily data (7 points)
            ...Array.from({ length: 7 }, (_, i) => i),
            
            // 1 month - every 5 days (6 points: 5, 10, 15, 20, 25, 30)
            ...Array.from({ length: 6 }, (_, i) => (i + 1) * 5),
            
            // 3 months - every 7 days (13 points: 37, 44, 51, 58, 65, 72, 79, 86, 93, 100, 107, 114, 121)
            ...Array.from({ length: 13 }, (_, i) => 37 + (i * 7)),
            
            // 6 months - every 9 days (20 points: 128, 137, 146, 155, 164, 173, 182, 191, 200, 209, 218, 227, 236, 245, 254, 263, 272, 281, 290, 299)
            ...Array.from({ length: 20 }, (_, i) => 128 + (i * 9)),
            
            // 1 year - every 11 days (33 points: 308, 319, 330, 341, 352, 363, 374, 385, 396, 407, 418, 429, 440, 451, 462, 473, 484, 495, 506, 517, 528, 539, 550, 561, 572, 583, 594, 605, 616, 627, 638, 649, 660)
            ...Array.from({ length: 33 }, (_, i) => 308 + (i * 11))
        ];

        // Sort intervals and remove duplicates
        const uniqueIntervals = [...new Set(intervals)].sort((a, b) => b - a);

        for (const daysAgo of uniqueIntervals) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - daysAgo);
            
            // Generate realistic price variations
            const variation = this.generatePriceVariation(basePrice, daysAgo, product.category);
            const price = Math.round(basePrice * variation);
            
            const change = daysAgo === 0 ? 0 : price - (priceHistory[priceHistory.length - 1]?.price || basePrice);
            const changePercent = daysAgo === 0 ? 0 : ((change / (priceHistory[priceHistory.length - 1]?.price || basePrice)) * 100);
            
            priceHistory.push({
                price,
                date,
                change,
                changePercent: Math.round(changePercent * 100) / 100,
                volume: Math.floor(Math.random() * 1000) + 100,
                marketCondition: this.getMarketCondition(changePercent)
            });
        }

        const currentPrice = priceHistory[priceHistory.length - 1].price;
        const changes = this.calculateAllChanges(priceHistory, currentPrice);

        return await priceHistoryModel.create({
            productId: product._id,
            location: {
                state: 'Maharashtra',
                city: 'Mumbai',
                region: 'Western'
            },
            currentPrice,
            priceHistory,
            marketTrend: changes.weekly.value > 0 ? 'up' : changes.weekly.value < 0 ? 'down' : 'stable',
            priceRange: {
                min: Math.min(...priceHistory.map(p => p.price)),
                max: Math.max(...priceHistory.map(p => p.price)),
                avg: priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length
            },
            changes,
            marketIndicators: {
                volatility: this.calculateVolatility(priceHistory),
                supportLevel: this.calculateSupportLevel(priceHistory),
                resistanceLevel: this.calculateResistanceLevel(priceHistory),
                trendStrength: this.calculateTrendStrength(priceHistory)
            }
        });
    };

    // Generate realistic price variation based on product category
    generatePriceVariation = (basePrice, daysAgo, category) => {
        const seasonalFactor = this.getSeasonalFactor(daysAgo);
        const categoryVolatility = this.getCategoryVolatility(category);
        const trendFactor = 1 + (daysAgo * 0.0001); // Slight upward trend over time
        
        // Add more realistic price variations with occasional significant changes
        let randomVariation;
        
        // 5% chance of significant price change (>10%)
        if (Math.random() < 0.05) {
            const significantChange = (Math.random() - 0.5) * 0.3; // ±15% change
            randomVariation = significantChange;
        } else {
            // Normal variation
            randomVariation = (Math.random() - 0.5) * categoryVolatility;
        }
        
        // Add market events (10% chance of market-driven changes)
        let marketEventFactor = 1;
        if (Math.random() < 0.1) {
            const eventTypes = ['supply_shortage', 'demand_surge', 'raw_material_cost', 'seasonal_demand'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            switch (eventType) {
                case 'supply_shortage':
                    marketEventFactor = 1.15; // 15% increase
                    break;
                case 'demand_surge':
                    marketEventFactor = 1.12; // 12% increase
                    break;
                case 'raw_material_cost':
                    marketEventFactor = 1.08; // 8% increase
                    break;
                case 'seasonal_demand':
                    marketEventFactor = 1.05; // 5% increase
                    break;
            }
        }
        
        return seasonalFactor * trendFactor * marketEventFactor * (1 + randomVariation);
    };

    // Get seasonal factor based on date
    getSeasonalFactor = (daysAgo) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const month = date.getMonth();
        
        // Higher prices in monsoon (June-Sept) and winter (Dec-Feb)
        if (month >= 5 && month <= 8) return 1.05; // Monsoon
        if (month === 11 || month <= 1) return 1.03; // Winter
        return 1.0; // Normal season
    };

    // Get volatility based on product category
    getCategoryVolatility = (category) => {
        const volatilityMap = {
            'Cement & Concrete': 0.12, // Increased for more realistic variations
            'Steel & Iron': 0.18,      // Higher volatility for steel
            'Bricks & Blocks': 0.08,   // Slightly increased
            'Tiles & Flooring': 0.14,  // Increased for seasonal variations
            'Electrical': 0.20,        // High volatility for electrical components
            'Plumbing': 0.12,          // Increased
            'Tools & Equipment': 0.10, // Increased
            'Paint & Chemicals': 0.15, // Increased for chemical price fluctuations
            'Hardware & Fasteners': 0.08, // Increased
            'Safety & Security': 0.10, // Increased
            'Doors & Windows': 0.12    // Increased for seasonal demand
        };
        return volatilityMap[category] || 0.12; // Default increased from 0.08
    };

    // Get market condition based on price change
    getMarketCondition = (changePercent) => {
        if (changePercent > 8) return 'bullish';
        if (changePercent < -8) return 'bearish';
        if (Math.abs(changePercent) > 5) return 'volatile';
        if (Math.abs(changePercent) > 2) return 'moderate';
        return 'stable';
    };

    // Filter data by time period - return specific number of data points
    filterDataByPeriod = (priceHistory, period) => {
        // Sort price history by date (newest first)
        const sortedHistory = priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        switch (period) {
            case '7D': 
                // Return 7 data points (daily for past 7 days)
                return sortedHistory.slice(0, 7);
            case '1M': 
                // Return 6 data points (every 5 days for past month)
                return sortedHistory.slice(0, 6);
            case '3M': 
                // Return 13 data points (every 7 days for past 3 months)
                return sortedHistory.slice(0, 13);
            case '6M': 
                // Return 20 data points (every 9 days for past 6 months)
                return sortedHistory.slice(0, 20);
            case '1Y': 
                // Return 33 data points (every 11 days for past year)
                return sortedHistory.slice(0, 33);
            default: 
                return sortedHistory.slice(0, 6); // Default to 1 month
        }
    };

    // Calculate all time period changes
    calculateAllChanges = (priceHistory, currentPrice) => {
        const now = new Date();
        const changes = {};
        
        const periods = [
            { name: 'daily', days: 1 },
            { name: 'weekly', days: 7 },
            { name: 'monthly', days: 30 },
            { name: 'quarterly', days: 90 },
            { name: 'yearly', days: 365 }
        ];
        
        periods.forEach(period => {
            const cutoffDate = new Date(now);
            cutoffDate.setDate(cutoffDate.getDate() - period.days);
            
            const historicalData = priceHistory.filter(item => new Date(item.date) >= cutoffDate);
            const historicalPrice = historicalData.length > 0 ? historicalData[0].price : currentPrice;
            
            const value = currentPrice - historicalPrice;
            const percent = historicalPrice > 0 ? (value / historicalPrice) * 100 : 0;
            
            changes[period.name] = {
                value: Math.round(value * 100) / 100,
                percent: Math.round(percent * 100) / 100
            };
        });
        
        return changes;
    };

    // Calculate additional metrics
    calculateMetrics = (priceHistory, currentPrice) => {
        if (priceHistory.length === 0) return {};
        
        const prices = priceHistory.map(p => p.price);
        const changes = priceHistory.map(p => p.changePercent);
        
        return {
            highest: Math.max(...prices),
            lowest: Math.min(...prices),
            average: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
            volatility: this.calculateVolatility(priceHistory),
            trend: this.calculateTrend(changes),
            supportLevel: this.calculateSupportLevel(priceHistory),
            resistanceLevel: this.calculateResistanceLevel(priceHistory)
        };
    };

    // Calculate volatility
    calculateVolatility = (priceHistory) => {
        if (priceHistory.length < 2) return 0;
        
        const prices = priceHistory.map(p => p.price);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
        
        return Math.round(Math.sqrt(variance) * 100) / 100;
    };

    // Calculate trend
    calculateTrend = (changes) => {
        if (changes.length < 2) return 'stable';
        
        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        
        if (avgChange > 1) return 'upward';
        if (avgChange < -1) return 'downward';
        return 'stable';
    };

    // Calculate support level (10th percentile)
    calculateSupportLevel = (priceHistory) => {
        const prices = priceHistory.map(p => p.price).sort((a, b) => a - b);
        const index = Math.floor(prices.length * 0.1);
        return prices[index] || 0;
    };

    // Calculate resistance level (90th percentile)
    calculateResistanceLevel = (priceHistory) => {
        const prices = priceHistory.map(p => p.price).sort((a, b) => a - b);
        const index = Math.floor(prices.length * 0.9);
        return prices[index] || 0;
    };

    // Calculate trend strength
    calculateTrendStrength = (priceHistory) => {
        const volatility = this.calculateVolatility(priceHistory);
        
        if (volatility < 2) return 'weak';
        if (volatility < 5) return 'moderate';
        return 'strong';
    };

    // Get all products with price history
    get_all_products_with_prices = async (req, res) => {
        try {
            const products = await productModel.find({ status: 'active' });
            const productsWithPrices = [];
            
            for (const product of products) {
                const priceHistory = await priceHistoryModel.findOne({ productId: product._id });
                productsWithPrices.push({
                    ...product.toObject(),
                    priceHistory: priceHistory || null
                });
            }
            
            responseReturn(res, 200, { 
                message: 'Products with price history retrieved successfully',
                products: productsWithPrices
            });
            
        } catch (error) {
            console.error('Error fetching products with prices:', error);
            responseReturn(res, 500, { message: 'Error fetching products with prices', error: error.message });
        }
    };

    // Get filter options for price history
    get_filter_options = async (req, res) => {
        try {
            // Get unique states
            const states = await priceHistoryModel.distinct('location.state');
            
            // Get unique cities
            const cities = await priceHistoryModel.distinct('location.city');
            
            // Get unique regions
            const regions = await priceHistoryModel.distinct('location.region');
            
            // Get unique categories from products
            const categories = await productModel.distinct('category');
            
            responseReturn(res, 200, {
                success: true,
                filterOptions: {
                    states: states.sort(),
                    cities: cities.sort(),
                    regions: regions.sort(),
                    categories: categories.sort()
                }
            });
        } catch (error) {
            console.error('Error fetching filter options:', error);
            responseReturn(res, 500, { 
                success: false, 
                message: 'Error fetching filter options', 
                error: error.message 
            });
        }
    };

    // Update price for a product
    update_price = async (req, res) => {
        try {
            const { productId } = req.params;
            const { newPrice, volume = 0 } = req.body;

            let priceHistory = await priceHistoryModel.findOne({ productId });
            if (!priceHistory) {
                const product = await productModel.findById(productId);
                if (!product) {
                    return responseReturn(res, 404, { message: 'Product not found' });
                }
                priceHistory = await this.createDefaultPriceHistory(product);
            }

            const oldPrice = priceHistory.currentPrice;
            const change = newPrice - oldPrice;
            const changePercent = oldPrice > 0 ? (change / oldPrice) * 100 : 0;

            // Add new price to history
            priceHistory.priceHistory.push({
                price: newPrice,
                date: new Date(),
                change,
                changePercent: Math.round(changePercent * 100) / 100,
                volume,
                marketCondition: this.getMarketCondition(changePercent)
            });

            // Keep only last 365 days of history
            if (priceHistory.priceHistory.length > 365) {
                priceHistory.priceHistory = priceHistory.priceHistory.slice(-365);
            }

            priceHistory.currentPrice = newPrice;
            priceHistory.lastUpdated = new Date();

            // Update all changes
            priceHistory.changes = this.calculateAllChanges(priceHistory.priceHistory, newPrice);
            
            // Update market trend
            priceHistory.marketTrend = priceHistory.changes.weekly.value > 0 ? 'up' : 
                                     priceHistory.changes.weekly.value < 0 ? 'down' : 'stable';

            // Update price range
            const prices = priceHistory.priceHistory.map(p => p.price);
            priceHistory.priceRange = {
                min: Math.min(...prices),
                max: Math.max(...prices),
                avg: prices.reduce((a, b) => a + b, 0) / prices.length
            };

            // Update market indicators
            priceHistory.marketIndicators = {
                volatility: this.calculateVolatility(priceHistory.priceHistory),
                supportLevel: this.calculateSupportLevel(priceHistory.priceHistory),
                resistanceLevel: this.calculateResistanceLevel(priceHistory.priceHistory),
                trendStrength: this.calculateTrendStrength(priceHistory.priceHistory)
            };

            await priceHistory.save();

            responseReturn(res, 200, { 
                message: 'Price updated successfully', 
                priceHistory: priceHistory 
            });

        } catch (error) {
            console.error('Error updating price:', error);
            responseReturn(res, 500, { message: 'Error updating price', error: error.message });
        }
    };
}

module.exports = new priceHistoryController();
