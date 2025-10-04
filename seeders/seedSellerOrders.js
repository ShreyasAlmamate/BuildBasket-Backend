const mongoose = require('mongoose');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const sellerModel = require('../models/sellerModel');

const seedSellerOrders = async () => {
    try {
        console.log('🌱 Starting seller orders seeding...');

        // Get first seller
        const seller = await sellerModel.findOne({ role: 'seller' });
        if (!seller) {
            console.log('❌ No seller found. Please seed sellers first.');
            return;
        }

        // Get products
        const products = await productModel.find({ status: 'active' }).limit(8);
        if (products.length === 0) {
            console.log('❌ No products found. Please seed products first.');
            return;
        }

        console.log(`📦 Found ${products.length} products`);
        console.log(`👤 Using seller: ${seller.name} (${seller._id})`);

        // Clear existing orders for this seller
        await orderModel.deleteMany({ sellerId: seller._id });
        console.log('🗑️ Cleared existing orders for seller');

        // Fixed data for consistency
        const customers = [
            { 
                name: 'John Contractor', 
                email: 'john@example.com', 
                phone: '+91 98765 43210', 
                address: '123 Main St, Mumbai, Maharashtra', 
                region: 'Western' 
            },
            { 
                name: 'Sarah Builder', 
                email: 'sarah@example.com', 
                phone: '+91 98765 43211', 
                address: '456 Park Ave, Delhi, Delhi', 
                region: 'Northern' 
            },
            { 
                name: 'Mike Engineer', 
                email: 'mike@example.com', 
                phone: '+91 98765 43212', 
                address: '789 Garden Rd, Bangalore, Karnataka', 
                region: 'Southern' 
            },
            { 
                name: 'Lisa Architect', 
                email: 'lisa@example.com', 
                phone: '+91 98765 43213', 
                address: '321 Tech Park, Hyderabad, Telangana', 
                region: 'Southern' 
            },
            { 
                name: 'Raj Contractor', 
                email: 'raj@example.com', 
                phone: '+91 98765 43214', 
                address: '654 Industrial Area, Chennai, Tamil Nadu', 
                region: 'Southern' 
            },
            { 
                name: 'Priya Sharma', 
                email: 'priya@example.com', 
                phone: '+91 98765 43215', 
                address: '789 Business Park, Pune, Maharashtra', 
                region: 'Western' 
            },
            { 
                name: 'Amit Kumar', 
                email: 'amit@example.com', 
                phone: '+91 98765 43216', 
                address: '456 Residential Complex, Gurgaon, Haryana', 
                region: 'Northern' 
            },
            { 
                name: 'Neha Gupta', 
                email: 'neha@example.com', 
                phone: '+91 98765 43217', 
                address: '321 Green Valley, Chandigarh, Punjab', 
                region: 'Northern' 
            }
        ];

        const orderStatuses = ['delivered', 'processing', 'shipped', 'pending', 'delivered', 'shipped', 'processing', 'delivered'];
        const paymentStatuses = ['paid', 'paid', 'paid', 'pending', 'paid', 'paid', 'paid', 'paid'];
        const fixedQuantities = [5, 3, 2, 4, 8, 6, 7, 1];

        const orders = [];
        let totalRevenue = 0;

        for (let i = 0; i < Math.min(8, customers.length); i++) {
            const customer = customers[i];
            const product = products[i % products.length];
            
            const quantity = fixedQuantities[i];
            const productPrice = product.price || 100;
            const orderPrice = productPrice * quantity;
            
            totalRevenue += orderPrice;
            
            const order = {
                sellerId: seller._id,
                price: orderPrice,
                delivery_status: orderStatuses[i],
                payment_status: paymentStatuses[i],
                createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
                customerInfo: {
                    name: customer.name,
                    email: customer.email
                },
                shippingInfo: {
                    address: customer.address,
                    phone: customer.phone,
                    region: customer.region
                },
                products: [
                    {
                        productId: product._id,
                        name: product.name,
                        quantity: quantity,
                        price: productPrice,
                        images: product.images || ['/images/placeholder.jpg'],
                        category: product.category,
                        brand: product.brand
                    }
                ]
            };
            
            orders.push(order);
        }

        // Insert orders into database
        const createdOrders = await orderModel.insertMany(orders);
        
        console.log(`✅ Created ${createdOrders.length} orders`);
        console.log(`💰 Total Revenue: ₹${totalRevenue}`);
        console.log(`📊 Average Order Value: ₹${Math.round(totalRevenue / createdOrders.length)}`);
        
        // Log order summary
        console.log('\n📋 Order Summary:');
        createdOrders.forEach((order, index) => {
            const product = order.products[0];
            console.log(`${index + 1}. ${product.name} - Qty: ${product.quantity} - ₹${order.price} - ${order.delivery_status}`);
        });

        console.log('\n🎉 Seller orders seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding seller orders:', error);
    }
};

// Run if called directly
if (require.main === module) {
    mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/almaMate')
        .then(() => {
            console.log('🔗 Connected to MongoDB');
            return seedSellerOrders();
        })
        .then(() => {
            console.log('✅ Seeding completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedSellerOrders;
