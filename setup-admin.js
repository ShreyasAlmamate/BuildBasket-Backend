const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const adminModel = require('./models/adminModel');
const fs = require('fs');
const path = require('path');

const setupAdmin = async () => {
    try {
        console.log('🚀 Setting up AlmaMate Admin...\n');
        
        // Create .env file if it doesn't exist
        const envPath = path.join(__dirname, '.env');
        if (!fs.existsSync(envPath)) {
            console.log('📝 Creating .env file...');
            const envContent = `# Database Configuration
DB_URL=mongodb://localhost:27017/almaMate

# Server Configuration
PORT=5000

# JWT Secret Key (Change this in production)
SECRET=your-super-secret-jwt-key-for-almaMate-project-2024

# Cloudinary Configuration (for image uploads)
cloud_name=your_cloudinary_cloud_name
api_key=your_cloudinary_api_key
api_secret=your_cloudinary_api_secret`;
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ .env file created successfully!');
        } else {
            console.log('✅ .env file already exists');
        }
        
        // Load environment variables
        require('dotenv').config();
        
        console.log('\n🔄 Connecting to MongoDB...');
        
        // Connect to database
        await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/almaMate');
        console.log('✅ Connected to MongoDB successfully!');
        
        // Check if admin exists
        const existingAdmin = await adminModel.findOne({ email: 'admin@buildbasket.com' });
        
        if (existingAdmin) {
            console.log('\n✅ Admin account already exists:');
            console.log(`   Name: ${existingAdmin.name}`);
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            
            // Test password
            const testPassword = 'admin123';
            const isPasswordValid = await bcrypt.compare(testPassword, existingAdmin.password);
            console.log(`   Password test: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
            
        } else {
            console.log('\n🔧 Creating admin account...');
            
            const newAdmin = await adminModel.create({
                name: 'Admin User',
                email: 'admin@buildbasket.com',
                password: await bcrypt.hash('admin123', 10),
                image: '/images/admin.jpg',
                role: 'admin'
            });
            
            console.log('✅ Admin account created successfully!');
            console.log(`   ID: ${newAdmin._id}`);
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Password: admin123`);
        }
        
        console.log('\n📋 Admin Login Details:');
        console.log('   Email: admin@buildbasket.com');
        console.log('   Password: admin123');
        console.log('   Login URL: POST http://localhost:5000/api/admin-login');
        
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('1. Make sure MongoDB is running: mongod');
        console.log('2. Start the backend server: npm start or node server.js');
        console.log('3. Test login with the credentials above');
        console.log('4. Check browser console for any CORS or network errors');
        
        console.log('\n🌐 Frontend Login URL:');
        console.log('   Dashboard: http://localhost:3001 (if running)');
        console.log('   Customer: http://localhost:3000 (if running)');
        
    } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('\n💡 Common Solutions:');
        console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
        console.log('2. Start MongoDB service: net start MongoDB (Windows)');
        console.log('3. Check if port 27017 is available');
        console.log('4. Make sure you have Node.js and npm installed');
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected from database');
        }
        process.exit(0);
    }
};

setupAdmin();
