const { Schema, model } = require("mongoose");

const buyerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        default: 'buyer'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    // Personal Information
    personalInfo: {
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        occupation: String,
        company: String,
        designation: String
    },
    // Address Information
    addresses: [{
        type: {
            type: String,
            enum: ['home', 'office', 'billing', 'shipping'],
            default: 'home'
        },
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    // Credit Limit Information
    creditInfo: {
        hasApplied: {
            type: Boolean,
            default: false
        },
        applicationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'not_applied'],
            default: 'not_applied'
        },
        requestedLimit: {
            type: Number,
            default: 0
        },
        approvedLimit: {
            type: Number,
            default: 0
        },
        currentUtilization: {
            type: Number,
            default: 0
        },
        availableCredit: {
            type: Number,
            default: 0
        },
        applicationDate: Date,
        approvalDate: Date,
        // Documents for credit application
        documents: [{
            type: {
                type: String,
                enum: ['income_proof', 'identity_proof', 'address_proof', 'bank_statement', 'other']
            },
            filename: String,
            url: String,
            uploadDate: {
                type: Date,
                default: Date.now
            }
        }],
        // Credit history
        creditHistory: [{
            amount: Number,
            type: {
                type: String,
                enum: ['utilized', 'repaid']
            },
            date: {
                type: Date,
                default: Date.now
            },
            orderId: {
                type: Schema.ObjectId,
                ref: 'orders'
            },
            description: String
        }],
        // Admin notes for credit application
        adminNotes: String,
        reviewedBy: {
            type: Schema.ObjectId,
            ref: 'admins'
        }
    },
    // Purchase History
    purchaseStats: {
        totalOrders: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        averageOrderValue: {
            type: Number,
            default: 0
        },
        lastOrderDate: Date,
        favoriteCategories: [String],
        preferredPaymentMethod: String
    },
    // Preferences
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'en'
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    // Verification
    verification: {
        email: {
            verified: {
                type: Boolean,
                default: false
            },
            verificationToken: String,
            verificationDate: Date
        },
        phone: {
            verified: {
                type: Boolean,
                default: false
            },
            verificationCode: String,
            verificationDate: Date
        }
    },
    // Login tracking
    lastLogin: Date,
    loginCount: {
        type: Number,
        default: 0
    },
    // Account flags
    flags: {
        isBlocked: {
            type: Boolean,
            default: false
        },
        blockReason: String,
        isVIP: {
            type: Boolean,
            default: false
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        }
    }
}, { 
    timestamps: true 
});

// Indexes for better performance
buyerSchema.index({ email: 1 });
buyerSchema.index({ phone: 1 });
buyerSchema.index({ 'creditInfo.applicationStatus': 1 });
buyerSchema.index({ status: 1 });
buyerSchema.index({ createdAt: -1 });

// Text search index
buyerSchema.index({
    name: 'text',
    email: 'text',
    phone: 'text'
});

// Virtual for available credit calculation (removed due to conflict with real field)

// Pre-save middleware to update available credit
buyerSchema.pre('save', function(next) {
    if (this.creditInfo.approvedLimit && this.creditInfo.currentUtilization) {
        this.creditInfo.availableCredit = this.creditInfo.approvedLimit - this.creditInfo.currentUtilization;
    }
    next();
});

module.exports = model('buyers', buyerSchema);
