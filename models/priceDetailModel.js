const {Schema, model} = require("mongoose");

const priceDetailSchema = new Schema({
    productId: {
        type: Schema.ObjectId,
        ref: 'products',
        required: true
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
            default: Date.now
        },
        change: {
            type: Number,
            default: 0
        },
        changePercent: {
            type: Number,
            default: 0
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
        }
    },
    weeklyChange: {
        type: Number,
        default: 0
    },
    monthlyChange: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

module.exports = model('priceDetails', priceDetailSchema);
