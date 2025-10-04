const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { responseReturn } = require('../../utiles/response');

// Import all models
const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const sellerModel = require('../../models/sellerModel');
const customerModel = require('../../models/customerModel');
const bannerModel = require('../../models/bannerModel');
const commodityModel = require('../../models/commodityModel');

// Configure multer for file uploads - using memory storage to avoid file locking issues
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class ExcelController {
  
  // Upload Excel file
  uploadExcel = upload.single('excelFile');

  // Import Categories from Excel
  importCategories = async (req, res) => {
    try {
      if (!req.file) {
        return responseReturn(res, 400, { message: 'No Excel file uploaded' });
      }

      // Read Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return responseReturn(res, 400, { message: 'Excel file is empty' });
      }

      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.name || !row.slug) {
            results.errors++;
            results.details.push(`Row ${i + 2}: Missing required fields (name, slug)`);
            continue;
          }

          // Check if category already exists
          const existingCategory = await categoryModel.findOne({ slug: row.slug });
          if (existingCategory) {
            // Update existing category
            await categoryModel.findByIdAndUpdate(existingCategory._id, {
              name: row.name,
              slug: row.slug,
              image: row.image || existingCategory.image,
              description: row.description || existingCategory.description
            });
            results.success++;
            results.details.push(`Row ${i + 2}: Updated category "${row.name}"`);
          } else {
            // Create new category
            await categoryModel.create({
              name: row.name,
              slug: row.slug,
              image: row.image || '',
              description: row.description || ''
            });
            results.success++;
            results.details.push(`Row ${i + 2}: Created category "${row.name}"`);
          }
        } catch (error) {
          results.errors++;
          results.details.push(`Row ${i + 2}: Error - ${error.message}`);
        }
      }

      // No file cleanup needed with memory storage

      responseReturn(res, 200, {
        message: 'Categories import completed',
        success: results.success,
        errors: results.errors,
        details: results.details,
        total: results.success + results.errors
      });

    } catch (error) {
      console.error('Excel import error:', error);
      responseReturn(res, 500, { message: 'Error importing categories', error: error.message });
    }
  };

  // Import Products from Excel
  importProducts = async (req, res) => {
    try {
      if (!req.file) {
        return responseReturn(res, 400, { message: 'No Excel file uploaded' });
      }

      console.log('Starting Excel import...');
      
      // Read Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Excel data rows: ${data.length}`);

      if (data.length === 0) {
        console.log('❌ Excel file is empty');
        return responseReturn(res, 400, { message: 'Excel file is empty' });
      }

      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      // Ensure default seller exists
      let defaultSeller = await sellerModel.findOne({ email: 'excel-import@default.com' });
      if (!defaultSeller) {
        defaultSeller = await sellerModel.create({
          name: 'Excel Import Seller',
          email: 'excel-import@default.com',
          password: 'default123',
          method: 'card',
          status: 'active',
          shopInfo: {
            shopName: 'Excel Import Shop',
            address: 'Default Address'
          }
        });
        console.log('Created default seller:', defaultSeller._id);
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.name || !row.price || !row.category) {
            results.errors++;
            results.details.push(`Row ${i + 2}: Missing required fields (name, price, category)`);
            continue;
          }

          // Ensure brand field exists
          if (!row.brand) {
            row.brand = 'Generic'; // Set default brand
          }

          // Generate unique slug
          const baseSlug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          let slug = baseSlug;
          let counter = 1;
          
          // Ensure unique slug
          while (await productModel.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          const productData = {
            name: row.name.trim(),
            slug: slug,
            price: parseFloat(row.price) || 0,
            category: row.category.trim(),
            brand: row.brand.trim(), // Now guaranteed to exist
            sellerId: defaultSeller._id, // Always use default seller
            shopName: (row.shopName && row.shopName.trim()) || 'Excel Import Shop',
            images: row.images ? row.images.split(',').map(img => img.trim()).filter(img => img) : ['default-product.jpg'],
            description: (row.description && row.description.trim()) || 'Imported from Excel',
            stock: parseInt(row.stock) || 0,
            discount: parseInt(row.discount) || 0,
            rating: parseFloat(row.rating) || 0,
            status: 'active'
          };

          console.log(`Creating product ${i + 1}/${data.length}: ${productData.name}`);

          // Check if product already exists by slug
          const existingProduct = await productModel.findOne({ slug: productData.slug });
          
          if (existingProduct) {
            // Update existing product
            await productModel.findByIdAndUpdate(existingProduct._id, productData);
            results.success++;
            results.details.push(`Row ${i + 2}: Updated product "${row.name}"`);
            console.log(`Updated product: ${row.name}`);
          } else {
            // Create new product
            const newProduct = await productModel.create(productData);
            results.success++;
            results.details.push(`Row ${i + 2}: Created product "${row.name}"`);
            console.log(`Created product: ${row.name}`);
          }
        } catch (error) {
          results.errors++;
          results.details.push(`Row ${i + 2}: Error - ${error.message}`);
          console.error(`❌ Error in row ${i + 2}:`, error.message);
        }
      }

      // Verify products were created
      const totalProducts = await productModel.countDocuments();
      const activeProducts = await productModel.countDocuments({ status: 'active' });
      const inactiveProducts = await productModel.countDocuments({ status: 'inactive' });
      const pendingProducts = await productModel.countDocuments({ status: 'pending' });
      
      console.log(`Import completed: ${results.success} successful, ${results.errors} errors`);
      console.log(`Database status: ${totalProducts} total, ${activeProducts} active`);

      responseReturn(res, 200, {
        message: 'Products import completed',
        success: results.success,
        errors: results.errors,
        details: results.details,
        total: results.success + results.errors,
        totalProducts: totalProducts,
        activeProducts: activeProducts,
        inactiveProducts: inactiveProducts,
        pendingProducts: pendingProducts
      });

    } catch (error) {
      console.error('Excel import error:', error);
      responseReturn(res, 500, { message: 'Error importing products', error: error.message });
    }
  };

  // Import Sellers from Excel
  importSellers = async (req, res) => {
    try {
      if (!req.file) {
        return responseReturn(res, 400, { message: 'No Excel file uploaded' });
      }

      // Read Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return responseReturn(res, 400, { message: 'Excel file is empty' });
      }

      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.name || !row.email || !row.phone) {
            results.errors++;
            results.details.push(`Row ${i + 2}: Missing required fields (name, email, phone)`);
            continue;
          }

          // Check if seller already exists
          const existingSeller = await sellerModel.findOne({ email: row.email });
          
          const sellerData = {
            name: row.name,
            email: row.email,
            phone: row.phone,
            password: row.password || 'defaultPassword123',
            shopName: row.shopName || row.name,
            address: row.address || '',
            city: row.city || '',
            state: row.state || '',
            pincode: row.pincode || '',
            image: row.image || '',
            status: row.status || 'active'
          };

          if (existingSeller) {
            // Update existing seller
            await sellerModel.findByIdAndUpdate(existingSeller._id, sellerData);
            results.success++;
            results.details.push(`Row ${i + 2}: Updated seller "${row.name}"`);
          } else {
            // Create new seller
            await sellerModel.create(sellerData);
            results.success++;
            results.details.push(`Row ${i + 2}: Created seller "${row.name}"`);
          }
        } catch (error) {
          results.errors++;
          results.details.push(`Row ${i + 2}: Error - ${error.message}`);
        }
      }

      // No file cleanup needed with memory storage

      responseReturn(res, 200, {
        message: 'Sellers import completed',
        success: results.success,
        errors: results.errors,
        details: results.details,
        total: results.success + results.errors
      });

    } catch (error) {
      console.error('Excel import error:', error);
      responseReturn(res, 500, { message: 'Error importing sellers', error: error.message });
    }
  };

  // Import Customers from Excel
  importCustomers = async (req, res) => {
    try {
      if (!req.file) {
        return responseReturn(res, 400, { message: 'No Excel file uploaded' });
      }

      // Read Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return responseReturn(res, 400, { message: 'Excel file is empty' });
      }

      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.name || !row.email || !row.phone) {
            results.errors++;
            results.details.push(`Row ${i + 2}: Missing required fields (name, email, phone)`);
            continue;
          }

          // Check if customer already exists
          const existingCustomer = await customerModel.findOne({ email: row.email });
          
          const customerData = {
            name: row.name,
            email: row.email,
            phone: row.phone,
            password: row.password || 'defaultPassword123',
            address: row.address || '',
            city: row.city || '',
            state: row.state || '',
            pincode: row.pincode || '',
            image: row.image || '',
            status: row.status || 'active'
          };

          if (existingCustomer) {
            // Update existing customer
            await customerModel.findByIdAndUpdate(existingCustomer._id, customerData);
            results.success++;
            results.details.push(`Row ${i + 2}: Updated customer "${row.name}"`);
          } else {
            // Create new customer
            await customerModel.create(customerData);
            results.success++;
            results.details.push(`Row ${i + 2}: Created customer "${row.name}"`);
          }
        } catch (error) {
          results.errors++;
          results.details.push(`Row ${i + 2}: Error - ${error.message}`);
        }
      }

      // No file cleanup needed with memory storage

      responseReturn(res, 200, {
        message: 'Customers import completed',
        success: results.success,
        errors: results.errors,
        details: results.details,
        total: results.success + results.errors
      });

    } catch (error) {
      console.error('Excel import error:', error);
      responseReturn(res, 500, { message: 'Error importing customers', error: error.message });
    }
  };

  // Import Banners from Excel
  importBanners = async (req, res) => {
    try {
      if (!req.file) {
        return responseReturn(res, 400, { message: 'No Excel file uploaded' });
      }

      // Read Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return responseReturn(res, 400, { message: 'Excel file is empty' });
      }

      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.title || !row.image) {
            results.errors++;
            results.details.push(`Row ${i + 2}: Missing required fields (title, image)`);
            continue;
          }

          // Check if banner already exists
          const existingBanner = await bannerModel.findOne({ title: row.title });
          
          const bannerData = {
            title: row.title,
            image: row.image,
            description: row.description || '',
            link: row.link || '',
            status: row.status || 'active',
            order: parseInt(row.order) || 0
          };

          if (existingBanner) {
            // Update existing banner
            await bannerModel.findByIdAndUpdate(existingBanner._id, bannerData);
            results.success++;
            results.details.push(`Row ${i + 2}: Updated banner "${row.title}"`);
          } else {
            // Create new banner
            await bannerModel.create(bannerData);
            results.success++;
            results.details.push(`Row ${i + 2}: Created banner "${row.title}"`);
          }
        } catch (error) {
          results.errors++;
          results.details.push(`Row ${i + 2}: Error - ${error.message}`);
        }
      }

      // No file cleanup needed with memory storage

      responseReturn(res, 200, {
        message: 'Banners import completed',
        success: results.success,
        errors: results.errors,
        details: results.details,
        total: results.success + results.errors
      });

    } catch (error) {
      console.error('Excel import error:', error);
      responseReturn(res, 500, { message: 'Error importing banners', error: error.message });
    }
  };

  // Get sample Excel templates
  getSampleTemplates = async (req, res) => {
    try {
      const templates = {
        categories: {
          headers: ['name', 'slug', 'image', 'description'],
          sampleData: [
            ['Electronics', 'electronics', 'https://example.com/electronics.jpg', 'Electronic products'],
            ['Clothing', 'clothing', 'https://example.com/clothing.jpg', 'Clothing and apparel']
          ]
        },
        products: {
          headers: ['name', 'slug', 'price', 'category', 'sellerId', 'shopName', 'images', 'description', 'stock', 'discount', 'rating', 'status'],
          sampleData: [
            ['iPhone 15', 'iphone-15', '999', 'Electronics', 'seller123', 'TechStore', 'https://example.com/iphone1.jpg,https://example.com/iphone2.jpg', 'Latest iPhone', '50', '10', '4.5', 'active']
          ]
        },
        sellers: {
          headers: ['name', 'email', 'phone', 'password', 'shopName', 'address', 'city', 'state', 'pincode', 'image', 'status'],
          sampleData: [
            ['John Doe', 'john@example.com', '1234567890', 'password123', 'John\'s Store', '123 Main St', 'Mumbai', 'Maharashtra', '400001', 'https://example.com/john.jpg', 'active']
          ]
        },
        customers: {
          headers: ['name', 'email', 'phone', 'password', 'address', 'city', 'state', 'pincode', 'image', 'status'],
          sampleData: [
            ['Jane Smith', 'jane@example.com', '0987654321', 'password123', '456 Oak Ave', 'Delhi', 'Delhi', '110001', 'https://example.com/jane.jpg', 'active']
          ]
        },
        banners: {
          headers: ['title', 'image', 'description', 'link', 'status', 'order'],
          sampleData: [
            ['Summer Sale', 'https://example.com/summer-banner.jpg', 'Big summer sale', '/sale', 'active', '1']
          ]
        }
      };

      responseReturn(res, 200, {
        message: 'Sample templates retrieved successfully',
        templates: templates
      });

    } catch (error) {
      console.error('Error getting templates:', error);
      responseReturn(res, 500, { message: 'Error retrieving templates', error: error.message });
    }
  };

  // Import Commodities from Excel
  importCommodities = async (req, res) => {
    try {
      if (!req.file) {
        return responseReturn(res, 400, { message: 'No Excel file uploaded' });
      }

      // Read Excel file from memory buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return responseReturn(res, 400, { message: 'Excel file is empty' });
      }

      const results = {
        success: 0,
        errors: 0,
        details: []
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Validate required fields
          if (!row.name || !row.category) {
            results.errors++;
            results.details.push(`Row ${i + 2}: Missing required fields (name, category)`);
            continue;
          }

          // Check if commodity already exists
          const existingCommodity = await commodityModel.findOne({ 
            name: { $regex: new RegExp(`^${row.name}$`, 'i') } 
          });

          const commodityData = {
            name: row.name.trim(),
            category: row.category.trim(),
            description: row.description?.trim() || '',
            unit: row.unit?.trim() || 'Unit',
            basePrice: parseFloat(row.basePrice) || 0,
            image: row.image || '',
            tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
          };

          if (existingCommodity) {
            // Update existing commodity
            await commodityModel.findByIdAndUpdate(existingCommodity._id, commodityData);
            results.success++;
            results.details.push(`Row ${i + 2}: Updated commodity "${row.name}"`);
          } else {
            // Create new commodity
            await commodityModel.create(commodityData);
            results.success++;
            results.details.push(`Row ${i + 2}: Created commodity "${row.name}"`);
          }

        } catch (error) {
          results.errors++;
          results.details.push(`Row ${i + 2}: Error - ${error.message}`);
        }
      }

      responseReturn(res, 200, {
        message: 'Commodities import completed',
        success: results.success,
        errors: results.errors,
        details: results.details,
        total: results.success + results.errors
      });

    } catch (error) {
      console.error('Excel import error:', error);
      responseReturn(res, 500, { error: error.message });
    }
  }

}

module.exports = new ExcelController();
