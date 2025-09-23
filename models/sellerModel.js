const {Schema, model} = require("mongoose");

const sellerSchema = new Schema({
    name: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required : true
    },
    password: {
        type: String,
        required : true,
        select: false
    },     
    role: {
        type: String,
        default : 'seller'
    },
    status: {
        type: String,
        default : 'pending'
    },
    payment: {
        type: String,
        default : 'inactive'
    },
    method: {
        type: String,
        required : true
    },
    image: {
        type: String,
        default : ''
    },
    shopInfo: {
        type: Object,
        default : {}
    },
    regions: [{
        type: String,
        required: false
    }],
    regionFares: [{
        region: {
            type: String,
            required: true
        },
        fare: {
            type: Number,
            required: true
        }
    }],
    gstRate: {
        type: Number,
        default: 18
    },
    paymentMethod: {
        type: String,
        enum: ['direct', 'sg_finserv'],
        default: 'direct'
    },
},{ timestamps: true })

sellerSchema.index({
    name: 'text',
    email: 'text', 
},{
    weights: {
        name: 5,
        email: 4, 
    }

})

module.exports = model('sellers',sellerSchema)