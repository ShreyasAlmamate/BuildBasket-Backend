const { Schema, model } = require("mongoose");

const commoditySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        default: ''
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    unit: {
        type: String,
        trim: true,
        default: 'Unit'
    },
    basePrice: {
        type: Number,
        default: 0,
        min: 0
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    // Market data for commodity tracking
    marketData: {
        currentPrice: {
            type: Number,
            default: 0
        },
        priceHistory: [{
            price: Number,
            date: {
                type: Date,
                default: Date.now
            }
        }],
        volatility: {
            type: Number,
            default: 0
        },
        trend: {
            type: String,
            enum: ['up', 'down', 'stable'],
            default: 'stable'
        }
    },
    // Regional availability
    regions: [{
        type: String,
        enum: ['Northern', 'Southern', 'Eastern', 'Western', 'Central']
    }],
    // Quality grades
    grades: [{
        name: String,
        description: String,
        priceMultiplier: {
            type: Number,
            default: 1
        }
    }],
    // Specifications
    specifications: {
        type: Map,
        of: String
    },
    // Tags for better searchability
    tags: [String],
    // Admin notes
    adminNotes: {
        type: String,
        default: ''
    }
}, { 
    timestamps: true 
});

// Create indexes for better performance
commoditySchema.index({ name: 'text', category: 'text', tags: 'text' });
commoditySchema.index({ category: 1 });
commoditySchema.index({ status: 1 });
commoditySchema.index({ slug: 1 });

// Pre-save middleware to generate slug
commoditySchema.pre('save', function(next) {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    next();
});

module.exports = model('commodities', commoditySchema);
