const {Schema, model} = require("mongoose");

const productSchema = new Schema({
    sellerId: {
        type: Schema.ObjectId,
        required : true
    },
    name: {
        type: String,
        required : true
    },
    slug: {
        type: String,
        required : true
    },
    category: {
        type: String,
        required : true
    },
    brand: {
        type: String,
        required : true
    },
    price: {
        type: Number,
        required : true
    },
    stock: {
        type: Number,
        required : true
    },
    discount: {
        type: Number,
        required : true
    },
    description: {
        type: String,
        required : true
    },
    shopName: {
        type: String,
        required : true
    },
    images: {
        type: Array,
        required : true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    rating: {
        type: Number,
        default : 0
    },
    // Commission-related fields
    finalPrice: {
        type: Number,
        default: 0
    },
    commissionAmount: {
        type: Number,
        default: 0
    },
    commissionType: {
        type: String,
        enum: ['fixed', 'percentage'],
        default: 'fixed'
    },
    lastCommissionUpdate: {
        type: Date,
        default: Date.now
    },
    // Location and Commodity fields for filtering
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
    // Using existing category field instead of commodityType
    // Credit eligibility flag
    eligibleForCreditSale: {
        type: Boolean,
        default: false
    }
     
}, {timestamps: true})

productSchema.index({
    name: 'text',
    category: 'text',
    brand: 'text',
    description: 'text'
},{
    weights: {
        name: 5,
        category: 4,
        brand: 3,
        description: 2
    }

})

module.exports = model('products',productSchema)