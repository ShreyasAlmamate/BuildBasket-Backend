const { Schema, model } = require("mongoose");

const commissionSchema = new Schema({
    commissionType: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed'
    },
    fixedAmount: {
        type: Number,
        default: 20 // Default ₹20 commission
    },
    percentageAmount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        default: "Platform commission"
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = model('commissions', commissionSchema);
