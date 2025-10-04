const mongoose = require('mongoose');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const sellerModel = require('../models/sellerModel');

const create5RealOrders = async () => {
    try {
        console.log('🚀 Creating 5 real orders with real products...\n');

        // Connect to database
        const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/almaMate';
        await mongoose.connect(dbUrl);
        console.log('✅ Connected to MongoDB\n');

        // Get first seller
        const seller = await sellerModel.findOne({ role: 'seller' });
        if (!seller) {
            console.log('❌ No seller found. Please create a seller first.');
            return;
        }
        console.log(`👤 Using seller: ${seller.name} (${seller._id})\n`);

        // Clear existing orders for this seller
        await orderModel.deleteMany({ sellerId: seller._id });
        console.log('🗑️ Cleared existing orders for seller\n');

        // Get real products from database
        const realProducts = await productModel.find({ status: 'active' }).limit(5);
        if (realProducts.length === 0) {
            console.log('❌ No products found in database. Please seed products first.');
            return;
        }

        console.log(`📦 Found ${realProducts.length} real products:`);
        realProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - ₹${product.price} (Stock: ${product.stock})`);
        });
        console.log('');

        // Real customers with complete details
        const customers = [
            { 
                name: 'Rajesh Contractor', 
                email: 'rajesh.contractor@gmail.com', 
                phone: '+91 98765 43210', 
                address: 'Plot 45, Sector 18, Noida, Uttar Pradesh - 201301', 
                region: 'Northern' 
            },
            { 
                name: 'Priya Construction Ltd', 
                email: 'priya.construction@company.com', 
                phone: '+91 98765 43211', 
                address: '12th Floor, Business Tower, Bandra Kurla Complex, Mumbai, Maharashtra - 400051', 
                region: 'Western' 
            },
            { 
                name: 'Karthik Builder', 
                email: 'karthik.builder@outlook.com', 
                phone: '+91 98765 43212', 
                address: 'No. 67, Brigade Road, Bangalore, Karnataka - 560025', 
                region: 'Southern' 
            },
            { 
                name: 'Sanjay Infrastructure', 
                email: 'sanjay.infra@gmail.com', 
                phone: '+91 98765 43213', 
                address: 'Cyber Towers, HITEC City, Hyderabad, Telangana - 500081', 
                region: 'Southern' 
            },
            { 
                name: 'Anita Home Builders', 
                email: 'anita.builders@yahoo.com', 
                phone: '+91 98765 43214', 
                address: 'Anna Salai, T. Nagar, Chennai, Tamil Nadu - 600017', 
                region: 'Southern' 
            }
        ];

        const orderStatuses = ['delivered', 'processing', 'shipped', 'pending', 'delivered'];
        const paymentStatuses = ['paid', 'paid', 'paid', 'pending', 'paid'];
        const fixedQuantities = [10, 5, 15, 8, 20]; // Realistic construction quantities

        const ordersToCreate = [];
        let totalRevenue = 0;

        console.log('📋 Creating orders:');
        for (let i = 0; i < 5; i++) {
            const customer = customers[i];
            const product = realProducts[i % realProducts.length];
            const quantity = fixedQuantities[i];
            const productPrice = product.price;
            const orderPrice = productPrice * quantity;
            
            totalRevenue += orderPrice;
            
            const order = {
                sellerId: seller._id,
                price: orderPrice,
                delivery_status: orderStatuses[i],
                payment_status: paymentStatuses[i],
                createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000), // Different dates
                customerInfo: {
                    name: customer.name,
                    email: customer.email
                },
                shippingInfo: {
                    address: customer.address,
                    phone: customer.phone,
                    region: customer.region
                },
                products: [{
                    productId: product._id,
                    name: product.name,
                    quantity: quantity,
                    price: productPrice,
                    images: product.images || ['/images/placeholder.jpg'],
                    category: product.category,
                    brand: product.brand
                }]
            };
            
            ordersToCreate.push(order);
            
            console.log(`${i + 1}. ${customer.name}`);
            console.log(`   📦 Product: ${product.name}`);
            console.log(`   💰 Price: ₹${productPrice} x ${quantity} = ₹${orderPrice}`);
            console.log(`   📍 Region: ${customer.region}`);
            console.log(`   📊 Status: ${orderStatuses[i]} | Payment: ${paymentStatuses[i]}\n`);
        }

        // Insert orders into database
        const createdOrders = await orderModel.insertMany(ordersToCreate);
        
        console.log(`✅ Successfully created ${createdOrders.length} orders in database!`);
        console.log(`💰 Total Revenue: ₹${totalRevenue}`);
        console.log(`📊 Average Order Value: ₹${Math.round(totalRevenue / createdOrders.length)}`);
        
        // Verify orders in database
        const verifyOrders = await orderModel.find({ sellerId: seller._id });
        console.log(`\n✅ Verification: ${verifyOrders.length} orders found in database for seller`);
        
        console.log('\n🎉 Setup complete! Now your dashboard will show consistent real data.');
        console.log('🌐 Visit: http://localhost:3000/seller/dashboard');
        
    } catch (error) {
        console.error('❌ Error creating orders:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected from MongoDB');
        }
        process.exit(0);
    }
};

// Run the seeder
create5RealOrders();
