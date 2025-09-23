const { Schema, model } = require("mongoose");

const priceHistorySchema = new Schema({
    productId: {
        type: Schema.ObjectId,
        ref: 'products',
        required: true,
        index: true
    },
    // Location and Commodity data for filtering
    location: {
        state: {
            type: String,
            required: true,
            default: 'Maharashtra'
        },
        city: {
            type: String,
            required: true,
            default: 'Mumbai'
        },
        region: {
            type: String,
            required: true,
            default: 'Western'
        }
    },
    currentPrice: {
        type: Number,
        required: true
    },
    priceHistory: [{
        price: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true,
            index: true
        },
        change: {
            type: Number,
            default: 0
        },
        changePercent: {
            type: Number,
            default: 0
        },
        volume: {
            type: Number,
            default: 0
        },
        marketCondition: {
            type: String,
            enum: ['bullish', 'bearish', 'stable', 'volatile', 'moderate'],
            default: 'stable'
        }
    }],
    marketTrend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    priceRange: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        avg: {
            type: Number,
            required: true
        }
    },
    // Time period changes
    changes: {
        daily: {
            value: { type: Number, default: 0 },
            percent: { type: Number, default: 0 }
        },
        weekly: {
            value: { type: Number, default: 0 },
            percent: { type: Number, default: 0 }
        },
        monthly: {
            value: { type: Number, default: 0 },
            percent: { type: Number, default: 0 }
        },
        quarterly: {
            value: { type: Number, default: 0 },
            percent: { type: Number, default: 0 }
        },
        yearly: {
            value: { type: Number, default: 0 },
            percent: { type: Number, default: 0 }
        }
    },
    // Market indicators
    marketIndicators: {
        volatility: {
            type: Number,
            default: 0
        },
        supportLevel: {
            type: Number,
            default: 0
        },
        resistanceLevel: {
            type: Number,
            default: 0
        },
        trendStrength: {
            type: String,
            enum: ['weak', 'moderate', 'strong'],
            default: 'moderate'
        }
    },
    // Price alerts and notifications
    alerts: [{
        type: {
            type: String,
            enum: ['price_rise', 'price_fall', 'volume_spike', 'trend_change'],
            required: true
        },
        threshold: {
            type: Number,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Regional pricing (for different cities)
    regionalPricing: [{
        city: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }]
}, { 
    timestamps: true,
    // Add indexes for better performance
    indexes: [
        { productId: 1, 'priceHistory.date': -1 },
        { 'priceHistory.date': -1 },
        { marketTrend: 1 }
    ]
});

// Pre-save middleware to calculate price changes
priceHistorySchema.pre('save', function(next) {
    if (this.priceHistory && this.priceHistory.length > 0) {
        const prices = this.priceHistory.map(p => p.price);
        this.priceRange.min = Math.min(...prices);
        this.priceRange.max = Math.max(...prices);
        this.priceRange.avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        // Calculate volatility
        const avg = this.priceRange.avg;
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
        this.marketIndicators.volatility = Math.sqrt(variance);
        
        // Calculate support and resistance levels
        const sortedPrices = [...prices].sort((a, b) => a - b);
        this.marketIndicators.supportLevel = sortedPrices[Math.floor(sortedPrices.length * 0.1)];
        this.marketIndicators.resistanceLevel = sortedPrices[Math.floor(sortedPrices.length * 0.9)];
    }
    next();
});

module.exports = model('priceHistory', priceHistorySchema);
