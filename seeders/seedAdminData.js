const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const sellerModel = require('../models/sellerModel');
const buyerModel = require('../models/buyerModel');
const commodityModel = require('../models/commodityModel');
const productModel = require('../models/productModel');
const customerOrder = require('../models/customerOrder');
const categoryModel = require('../models/categoryModel');

const seedAdminData = async () => {
    try {
        console.log('🌱 Starting admin data seeding...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // 1. Seed Commodities
        console.log('📦 Seeding commodities...');
        const commodities = [
            {
                name: 'Portland Cement',
                category: 'Construction Materials',
                description: 'High-quality Portland cement for construction projects',
                unit: 'Bag (50kg)',
                basePrice: 350,
                tags: ['cement', 'construction', 'building'],
                regions: ['Western', 'Northern'],
                status: 'active'
            },
            {
                name: 'Steel TMT Bars',
                category: 'Construction Materials', 
                description: 'Thermo-mechanically treated steel bars for reinforcement',
                unit: 'Ton',
                basePrice: 65000,
                tags: ['steel', 'reinforcement', 'construction'],
                regions: ['Western', 'Northern', 'Southern'],
                status: 'active'
            },
            {
                name: 'Red Clay Bricks',
                category: 'Construction Materials',
                description: 'Traditional red clay bricks for masonry work',
                unit: 'Thousand pieces',
                basePrice: 8500,
                tags: ['bricks', 'clay', 'masonry'],
                regions: ['Northern', 'Eastern'],
                status: 'active'
            },
            {
                name: 'Wheat',
                category: 'Agricultural Products',
                description: 'Premium quality wheat grains',
                unit: 'Quintal',
                basePrice: 2200,
                tags: ['wheat', 'grains', 'agriculture'],
                regions: ['Northern', 'Central'],
                status: 'active'
            },
            {
                name: 'Rice',
                category: 'Agricultural Products',
                description: 'Basmati rice for premium quality',
                unit: 'Quintal',
                basePrice: 4500,
                tags: ['rice', 'basmati', 'agriculture'],
                regions: ['Northern', 'Eastern'],
                status: 'active'
            },
            {
                name: 'Industrial Machinery',
                category: 'Industrial Equipment',
                description: 'Heavy-duty industrial machinery for manufacturing',
                unit: 'Unit',
                basePrice: 250000,
                tags: ['machinery', 'industrial', 'manufacturing'],
                regions: ['Western', 'Southern'],
                status: 'active'
            }
        ];

        for (const commodity of commodities) {
            const existing = await commodityModel.findOne({ name: commodity.name });
            if (!existing) {
                await commodityModel.create(commodity);
                console.log(`✅ Created commodity: ${commodity.name}`);
            }
        }

        // 2. Seed Buyers with Credit Applications
        console.log('👥 Seeding buyers...');
        const buyers = [
            {
                name: 'Metro Construction Ltd',
                email: 'metro.construction@company.com',
                phone: '+91 98765 43210',
                password: await bcrypt.hash('password123', 10),
                status: 'active',
                personalInfo: {
                    occupation: 'Construction Business',
                    company: 'Metro Construction Ltd'
                },
                creditInfo: {
                    hasApplied: true,
                    applicationStatus: 'approved',
                    requestedLimit: 500000,
                    approvedLimit: 400000,
                    currentUtilization: 150000,
                    availableCredit: 250000,
                    applicationDate: new Date('2024-01-15'),
                    approvalDate: new Date('2024-01-20')
                },
                purchaseStats: {
                    totalOrders: 25,
                    totalSpent: 850000,
                    averageOrderValue: 34000
                }
            },
            {
                name: 'Green Farms Pvt Ltd',
                email: 'green.farms@company.com',
                phone: '+91 98765 43211',
                password: await bcrypt.hash('password123', 10),
                status: 'active',
                personalInfo: {
                    occupation: 'Agriculture Business',
                    company: 'Green Farms Pvt Ltd'
                },
                creditInfo: {
                    hasApplied: true,
                    applicationStatus: 'approved',
                    requestedLimit: 300000,
                    approvedLimit: 300000,
                    currentUtilization: 120000,
                    availableCredit: 180000,
                    applicationDate: new Date('2024-02-01'),
                    approvalDate: new Date('2024-02-05')
                },
                purchaseStats: {
                    totalOrders: 18,
                    totalSpent: 540000,
                    averageOrderValue: 30000
                }
            },
            {
                name: 'Tech Manufacturing Co',
                email: 'tech.manufacturing@company.com',
                phone: '+91 98765 43212',
                password: await bcrypt.hash('password123', 10),
                status: 'active',
                personalInfo: {
                    occupation: 'Manufacturing',
                    company: 'Tech Manufacturing Co'
                },
                creditInfo: {
                    hasApplied: true,
                    applicationStatus: 'pending',
                    requestedLimit: 750000,
                    approvedLimit: 0,
                    currentUtilization: 0,
                    availableCredit: 0,
                    applicationDate: new Date('2024-03-01')
                },
                purchaseStats: {
                    totalOrders: 12,
                    totalSpent: 320000,
                    averageOrderValue: 26667
                }
            },
            {
                name: 'Urban Developers',
                email: 'urban.developers@company.com',
                phone: '+91 98765 43213',
                password: await bcrypt.hash('password123', 10),
                status: 'active',
                personalInfo: {
                    occupation: 'Real Estate Development',
                    company: 'Urban Developers'
                },
                creditInfo: {
                    hasApplied: false,
                    applicationStatus: 'not_applied'
                },
                purchaseStats: {
                    totalOrders: 8,
                    totalSpent: 180000,
                    averageOrderValue: 22500
                }
            }
        ];

        for (const buyer of buyers) {
            const existing = await buyerModel.findOne({ email: buyer.email });
            if (!existing) {
                await buyerModel.create(buyer);
                console.log(`✅ Created buyer: ${buyer.name}`);
            }
        }

        // 3. Update existing sellers with regions
        console.log('🏪 Updating sellers with regions...');
        const sellers = await sellerModel.find({});
        const regions = ['Western', 'Northern', 'Southern', 'Eastern', 'Central'];
        
        for (let i = 0; i < sellers.length; i++) {
            const seller = sellers[i];
            if (!seller.regions || seller.regions.length === 0) {
                // Assign 1-3 random regions to each seller
                const numRegions = Math.floor(Math.random() * 3) + 1;
                const sellerRegions = [];
                for (let j = 0; j < numRegions; j++) {
                    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
                    if (!sellerRegions.includes(randomRegion)) {
                        sellerRegions.push(randomRegion);
                    }
                }
                seller.regions = sellerRegions;
                await seller.save();
                console.log(`✅ Updated seller ${seller.name} with regions: ${sellerRegions.join(', ')}`);
            }
        }

        // 4. Create some sample orders
        console.log('📋 Creating sample orders...');
        const customers = await buyerModel.find({}).limit(3);
        const products = await productModel.find({}).limit(5);
        
        if (customers.length > 0 && products.length > 0) {
            const sampleOrders = [
                {
                    customerId: customers[0]._id,
                    price: 45000,
                    payment_status: 'paid',
                    delivery_status: 'delivered',
                    shippingInfo: 'Express delivery to construction site',
                    products: [
                        {
                            _id: products[0]._id,
                            name: products[0].name,
                            price: products[0].price,
                            quantity: 2
                        }
                    ],
                    date: new Date('2024-02-15').toLocaleDateString()
                },
                {
                    customerId: customers[1]._id,
                    price: 32500,
                    payment_status: 'paid',
                    delivery_status: 'processing',
                    shippingInfo: 'Standard delivery',
                    products: [
                        {
                            _id: products[1]._id,
                            name: products[1].name,
                            price: products[1].price,
                            quantity: 1
                        }
                    ],
                    date: new Date('2024-03-01').toLocaleDateString()
                },
                {
                    customerId: customers[2]._id,
                    price: 18500,
                    payment_status: 'paid',
                    delivery_status: 'shipped',
                    shippingInfo: 'Bulk delivery to warehouse',
                    products: [
                        {
                            _id: products[2]._id,
                            name: products[2].name,
                            price: products[2].price,
                            quantity: 3
                        }
                    ],
                    date: new Date('2024-03-05').toLocaleDateString()
                }
            ];

            for (const order of sampleOrders) {
                const existing = await customerOrder.findOne({ 
                    customerId: order.customerId,
                    price: order.price 
                });
                if (!existing) {
                    await customerOrder.create(order);
                    console.log(`✅ Created order for ${order.price}`);
                }
            }
        }

        console.log('🎉 Admin data seeding completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - Commodities: ${await commodityModel.countDocuments()}`);
        console.log(`   - Buyers: ${await buyerModel.countDocuments()}`);
        console.log(`   - Sellers: ${await sellerModel.countDocuments()}`);
        console.log(`   - Orders: ${await customerOrder.countDocuments()}`);
        console.log(`   - Products: ${await productModel.countDocuments()}`);

    } catch (error) {
        console.error('❌ Error seeding admin data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the seeder
if (require.main === module) {
    seedAdminData();
}

module.exports = seedAdminData;
