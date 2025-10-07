const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const adminModel = require("../models/adminModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");
const customerModel = require("../models/customerModel");
const priceHistoryModel = require("../models/priceHistoryModel");

const seedData = async () => {
  console.log("🌱 Starting database seeding...");
  try {
    // Connect to database
    await mongoose.connect(
      process.env.DB_URL || "mongodb://localhost:27017/almaMate"
    );
    console.log("Connected to database");

    // Clear existing data (optional - comment out for production)
    // await adminModel.deleteMany({});
    // await categoryModel.deleteMany({});
    // await productModel.deleteMany({});
    // await sellerModel.deleteMany({});
    // Create Admin User
    const adminExists = await adminModel.findOne({
      email: "admin@buildbasket.com",
    });
    if (!adminExists) {
      await adminModel.create({
        name: "Admin User",
        email: "admin@buildbasket.com",
        password: await bcrypt.hash("admin123", 10),
        image: "/images/admin.jpg",
        role: "admin",
      });
      console.log("✅ Admin user created");
    }

    // Create Test Customers
    const customers = [
      {
        name: "Test Customer",
        email: "customer@buildbasket.com",
        password: "customer123",
      },
      {
        name: "John Contractor",
        email: "john@buildbasket.com",
        password: "john123",
      },
      {
        name: "Sarah Builder",
        email: "sarah@buildbasket.com",
        password: "sarah123",
      },
      {
        name: "Mike Engineer",
        email: "mike@buildbasket.com",
        password: "mike123",
      },
    ];

    for (const customerData of customers) {
      const customerExists = await customerModel.findOne({
        email: customerData.email,
      });
      if (!customerExists) {
        await customerModel.create({
          name: customerData.name,
          email: customerData.email,
          password: await bcrypt.hash(customerData.password, 10),
          method: "manually",
        });

        // Create customer chat model
        const customer = await customerModel.findOne({
          email: customerData.email,
        });
        await sellerCustomerModel.create({
          myId: customer._id,
        });

        console.log(`✅ Customer created: ${customerData.name}`);
      }
    }

    // Create Sample Categories
    const categories = [
      {
        name: "Cement & Concrete",
        slug: "cement-concrete",
        image:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop",
      },
      {
        name: "Steel & Iron",
        slug: "steel-iron",
        image:
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop",
      },
      {
        name: "Bricks & Blocks",
        slug: "bricks-blocks",
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      },
      {
        name: "Tiles & Flooring",
        slug: "tiles-flooring",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      },
      {
        name: "Electrical",
        slug: "electrical",
        image:
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop",
      },
      {
        name: "Plumbing",
        slug: "plumbing",
        image:
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop",
      },
      {
        name: "Tools & Equipment",
        slug: "tools-equipment",
        image:
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=200&fit=crop",
      },
      {
        name: "Paint & Chemicals",
        slug: "paint-chemicals",
        image:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop",
      },
      {
        name: "Hardware & Fasteners",
        slug: "hardware-fasteners",
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      },
      {
        name: "Safety & Security",
        slug: "safety-security",
        image:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop",
      },
      {
        name: "Doors & Windows",
        slug: "doors-windows",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      },
      {
        name: "Roofing Materials",
        slug: "roofing-materials",
        image:
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop",
      },
      {
        name: "Insulation",
        slug: "insulation",
        image:
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop",
      },
      {
        name: "Garden & Outdoor",
        slug: "garden-outdoor",
        image:
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop",
      },
      {
        name: "Kitchen & Bathroom",
        slug: "kitchen-bathroom",
        image:
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=200&fit=crop",
      },
      {
        name: "Lumber & Wood",
        slug: "lumber-wood",
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      },
      {
        name: "Glass & Mirrors",
        slug: "glass-mirrors",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      },
      {
        name: "HVAC & Ventilation",
        slug: "hvac-ventilation",
        image:
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop",
      },
      {
        name: "Landscaping",
        slug: "landscaping",
        image:
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=300&h=200&fit=crop",
      },
      {
        name: "Lighting & Fixtures",
        slug: "lighting-fixtures",
        image:
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=200&fit=crop",
      },
    ];

    for (const category of categories) {
      const exists = await categoryModel.findOne({ name: category.name });
      if (!exists) {
        await categoryModel.create(category);
        console.log(`✅ Category created: ${category.name}`);
      }
    }

    // Create Sample Sellers
    const sellers = [
      {
        name: "Build Materials Pro",
        email: "seller@buildbasket.com",
        password: "seller123",
        shopInfo: {
          shopName: "Build Materials Pro",
          division: "Central",
          district: "Metro",
          sub_district: "Downtown",
        },
      },
      {
        name: "Steel & Hardware Hub",
        email: "steelhub@buildbasket.com",
        password: "steel123",
        shopInfo: {
          shopName: "Steel & Hardware Hub",
          division: "North",
          district: "Industrial",
          sub_district: "Steel City",
        },
      },
      {
        name: "Electrical Solutions",
        email: "electrical@buildbasket.com",
        password: "electrical123",
        shopInfo: {
          shopName: "Electrical Solutions",
          division: "South",
          district: "Tech",
          sub_district: "Power Zone",
        },
      },
      {
        name: "Plumbing Masters",
        email: "plumbing@buildbasket.com",
        password: "plumbing123",
        shopInfo: {
          shopName: "Plumbing Masters",
          division: "East",
          district: "Water",
          sub_district: "Flow District",
        },
      },
    ];

    let sellerIds = [];
    for (const sellerData of sellers) {
      const sellerExists = await sellerModel.findOne({
        email: sellerData.email,
      });
      let sellerId;
      if (!sellerExists) {
        const seller = await sellerModel.create({
          name: sellerData.name,
          email: sellerData.email,
          password: await bcrypt.hash(sellerData.password, 10),
          role: "seller",
          status: "active",
          method: "manually",
          image: "/images/seller.png",
          shopInfo: sellerData.shopInfo,
        });
        sellerId = seller._id;

        // Create seller chat model
        await sellerCustomerModel.create({
          myId: seller._id,
        });

        console.log(`✅ Seller created: ${sellerData.name}`);
      } else {
        sellerId = sellerExists._id;
      }
      sellerIds.push(sellerId);
    }

    // Create Sample Products
    const products = [
      {
        name: "Portland Cement 50kg",
        category: "Cement & Concrete",
        brand: "BuildPro",
        price: 450,
        stock: 100,
        discount: 10,
        description:
          "High-quality Portland cement suitable for all construction needs. Meets all industry standards.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Steel TMT Bars 12mm",
        category: "Steel & Iron",
        brand: "SteelMax",
        price: 650,
        stock: 200,
        discount: 5,
        description:
          "High-strength TMT bars with superior corrosion resistance. Perfect for structural applications.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.8,
      },
      {
        name: "Red Clay Bricks",
        category: "Bricks & Blocks",
        brand: "BrickCraft",
        price: 8,
        stock: 5000,
        discount: 0,
        description:
          "Premium quality red clay bricks with excellent thermal properties and durability.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Ceramic Floor Tiles 60x60cm",
        category: "Tiles & Flooring",
        brand: "TileMax",
        price: 85,
        stock: 300,
        discount: 15,
        description:
          "Beautiful ceramic floor tiles with anti-slip surface. Perfect for modern homes.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Copper Wire 2.5mm",
        category: "Electrical",
        brand: "ElectroMax",
        price: 180,
        stock: 150,
        discount: 8,
        description:
          "High-grade copper wire for electrical installations. ISI certified.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "PVC Pipes 4 inch",
        category: "Plumbing",
        brand: "PipePro",
        price: 120,
        stock: 80,
        discount: 12,
        description:
          "Durable PVC pipes for water supply and drainage systems. UV resistant.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Power Drill 13mm",
        category: "Tools & Equipment",
        brand: "ToolMaster",
        price: 2500,
        stock: 25,
        discount: 20,
        description:
          "Professional grade power drill with variable speed control and LED light.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Exterior Wall Paint 20L",
        category: "Paint & Chemicals",
        brand: "ColorMax",
        price: 1200,
        stock: 60,
        discount: 5,
        description:
          "Weather-resistant exterior paint with 10-year warranty. Available in multiple colors.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.1,
      },
      {
        name: "Stainless Steel Bolts Set",
        category: "Hardware & Fasteners",
        brand: "FastenPro",
        price: 150,
        stock: 200,
        discount: 10,
        description:
          "High-quality stainless steel bolts in various sizes. Corrosion resistant and durable.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Safety Helmet with LED",
        category: "Safety & Security",
        brand: "SafeGuard",
        price: 800,
        stock: 50,
        discount: 15,
        description:
          "Industrial safety helmet with built-in LED light. ANSI certified for maximum protection.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Wooden Door Frame",
        category: "Doors & Windows",
        brand: "DoorCraft",
        price: 2500,
        stock: 30,
        discount: 8,
        description:
          "Premium teak wood door frame with weather-resistant finish. Ready for installation.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Asphalt Shingles",
        category: "Roofing Materials",
        brand: "RoofMax",
        price: 45,
        stock: 500,
        discount: 12,
        description:
          "High-quality asphalt shingles with 30-year warranty. Weather and UV resistant.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Fiberglass Insulation Roll",
        category: "Insulation",
        brand: "InsulMax",
        price: 1200,
        stock: 40,
        discount: 18,
        description:
          "Thermal insulation roll for walls and ceilings. Fire resistant and eco-friendly.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Garden Hose 50ft",
        category: "Garden & Outdoor",
        brand: "GardenPro",
        price: 350,
        stock: 75,
        discount: 5,
        description:
          "Heavy-duty garden hose with brass fittings. Kink-resistant and UV protected.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Kitchen Faucet Chrome",
        category: "Kitchen & Bathroom",
        brand: "FaucetMax",
        price: 1800,
        stock: 25,
        discount: 20,
        description:
          "Modern kitchen faucet with pull-down sprayer. Chrome finish with ceramic disc valves.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.8,
      },
      {
        name: "LED Strip Lights 5m",
        category: "Electrical",
        brand: "LightMax",
        price: 450,
        stock: 100,
        discount: 25,
        description:
          "Flexible LED strip lights with remote control. RGB color changing with adhesive backing.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Concrete Mixer 1 Bag",
        category: "Tools & Equipment",
        brand: "MixMaster",
        price: 3500,
        stock: 15,
        discount: 10,
        description:
          "Portable concrete mixer with 1 bag capacity. Electric motor with safety features.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Marble Tiles 30x30cm",
        category: "Tiles & Flooring",
        brand: "MarbleMax",
        price: 120,
        stock: 200,
        discount: 15,
        description:
          "Premium Italian marble tiles with polished finish. Perfect for luxury interiors.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.9,
      },
      {
        name: "Steel Wire Mesh",
        category: "Steel & Iron",
        brand: "MeshPro",
        price: 85,
        stock: 150,
        discount: 8,
        description:
          "Galvanized steel wire mesh for construction and fencing. Rust resistant coating.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional Products for New Categories
      {
        name: "Pine Wood Planks 2x4x8",
        category: "Lumber & Wood",
        brand: "WoodCraft",
        price: 45,
        stock: 200,
        discount: 5,
        description:
          "Premium pine wood planks for framing and construction. Kiln-dried and treated.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Tempered Glass Panel 6mm",
        category: "Glass & Mirrors",
        brand: "GlassMax",
        price: 180,
        stock: 80,
        discount: 10,
        description:
          "Safety tempered glass panel for windows and doors. Shatter-resistant and clear.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Ceiling Fan with Light",
        category: "HVAC & Ventilation",
        brand: "FanPro",
        price: 1200,
        stock: 40,
        discount: 15,
        description:
          "Energy-efficient ceiling fan with LED light. Remote control and reversible motor.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Decorative Garden Stones",
        category: "Landscaping",
        brand: "GardenMax",
        price: 25,
        stock: 300,
        discount: 0,
        description:
          "Natural decorative stones for garden landscaping. Various sizes and colors available.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Chandelier Crystal 6-Light",
        category: "Lighting & Fixtures",
        brand: "LightMax",
        price: 2500,
        stock: 15,
        discount: 20,
        description:
          "Elegant crystal chandelier with 6 lights. Perfect for dining rooms and living areas.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.8,
      },
      // More Cement & Concrete Products
      {
        name: "Ready Mix Concrete 1 Cubic Meter",
        category: "Cement & Concrete",
        brand: "ConcreteMax",
        price: 3500,
        stock: 50,
        discount: 8,
        description:
          "Ready-to-use concrete mix for foundations and slabs. High strength and durability.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Concrete Blocks 8x8x16",
        category: "Cement & Concrete",
        brand: "BlockPro",
        price: 12,
        stock: 1000,
        discount: 5,
        description:
          "Standard concrete blocks for construction. High density and weather resistant.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // More Steel & Iron Products
      {
        name: "Steel Angle Iron 2x2x1/4",
        category: "Steel & Iron",
        brand: "SteelMax",
        price: 180,
        stock: 120,
        discount: 12,
        description:
          "Structural steel angle iron for framing and support. Galvanized finish.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Steel Sheet 4x8x1/8",
        category: "Steel & Iron",
        brand: "SheetPro",
        price: 220,
        stock: 60,
        discount: 10,
        description:
          "Flat steel sheet for fabrication and construction. Clean and smooth surface.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // More Electrical Products
      {
        name: "Circuit Breaker 20A",
        category: "Electrical",
        brand: "ElectroMax",
        price: 350,
        stock: 100,
        discount: 15,
        description:
          "Single pole circuit breaker for electrical panels. UL listed and certified.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Electrical Outlet GFCI",
        category: "Electrical",
        brand: "OutletPro",
        price: 45,
        stock: 200,
        discount: 8,
        description:
          "Ground fault circuit interrupter outlet for safety. Weather resistant cover.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // More Plumbing Products
      {
        name: "Water Heater 50 Gallon",
        category: "Plumbing",
        brand: "WaterMax",
        price: 4500,
        stock: 20,
        discount: 18,
        description:
          "Energy-efficient electric water heater. 6-year warranty and digital display.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Toilet Complete Set",
        category: "Plumbing",
        brand: "ToiletPro",
        price: 2800,
        stock: 35,
        discount: 12,
        description:
          "Complete toilet set with seat and installation hardware. Water-saving dual flush.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      // More Tools & Equipment
      {
        name: "Circular Saw 7.25 inch",
        category: "Tools & Equipment",
        brand: "SawMax",
        price: 1800,
        stock: 30,
        discount: 15,
        description:
          "Professional circular saw with laser guide. Corded electric with safety features.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Level Tool 48 inch",
        category: "Tools & Equipment",
        brand: "LevelPro",
        price: 120,
        stock: 80,
        discount: 5,
        description:
          "Professional aluminum level with magnetic base. Vial accuracy guaranteed.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // More Paint & Chemicals
      {
        name: "Primer Paint 1 Gallon",
        category: "Paint & Chemicals",
        brand: "PrimerMax",
        price: 180,
        stock: 100,
        discount: 10,
        description:
          "High-quality primer paint for all surfaces. Low VOC and quick drying.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Wood Stain Dark Oak",
        category: "Paint & Chemicals",
        brand: "StainPro",
        price: 95,
        stock: 150,
        discount: 8,
        description:
          "Premium wood stain for interior and exterior use. UV protection included.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      // Additional Bricks & Blocks Products
      {
        name: "Hollow Concrete Blocks 6 inch",
        category: "Bricks & Blocks",
        brand: "BlockMax",
        price: 15,
        stock: 800,
        discount: 5,
        description:
          "Hollow concrete blocks for non-load bearing walls. Lightweight and energy efficient.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Fly Ash Bricks 9x4x3",
        category: "Bricks & Blocks",
        brand: "EcoBrick",
        price: 6,
        stock: 2000,
        discount: 8,
        description:
          "Eco-friendly fly ash bricks with high strength and thermal insulation.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "AAC Blocks 8x8x24",
        category: "Bricks & Blocks",
        brand: "AACMax",
        price: 35,
        stock: 500,
        discount: 10,
        description:
          "Autoclaved Aerated Concrete blocks. Lightweight, fire resistant, and energy efficient.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      // Additional Tiles & Flooring Products
      {
        name: "Vitrified Tiles 60x60cm",
        category: "Tiles & Flooring",
        brand: "TilePro",
        price: 95,
        stock: 400,
        discount: 12,
        description:
          "High-quality vitrified tiles with anti-slip surface. Perfect for high-traffic areas.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Wooden Flooring Planks",
        category: "Tiles & Flooring",
        brand: "WoodFloor",
        price: 180,
        stock: 200,
        discount: 15,
        description:
          "Engineered wooden flooring with oak finish. Easy installation and maintenance.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Vinyl Flooring Roll 4m",
        category: "Tiles & Flooring",
        brand: "VinylMax",
        price: 45,
        stock: 150,
        discount: 8,
        description:
          "Waterproof vinyl flooring with wood grain texture. Easy to clean and maintain.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional Hardware & Fasteners Products
      {
        name: "Wood Screws Assorted Pack",
        category: "Hardware & Fasteners",
        brand: "ScrewPro",
        price: 85,
        stock: 300,
        discount: 10,
        description:
          "Assorted wood screws in various sizes. Zinc plated for corrosion resistance.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Anchor Bolts M12x100",
        category: "Hardware & Fasteners",
        brand: "AnchorMax",
        price: 25,
        stock: 200,
        discount: 5,
        description:
          "Heavy-duty anchor bolts for concrete and masonry. Galvanized finish.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Nails Assorted Box",
        category: "Hardware & Fasteners",
        brand: "NailPro",
        price: 35,
        stock: 500,
        discount: 8,
        description:
          "Mixed nails in various sizes for different construction needs. Galvanized finish.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      // Additional Safety & Security Products
      {
        name: "Safety Goggles Clear",
        category: "Safety & Security",
        brand: "SafeGuard",
        price: 120,
        stock: 100,
        discount: 10,
        description:
          "Clear safety goggles with anti-fog coating. ANSI Z87.1 certified.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Safety Gloves Leather",
        category: "Safety & Security",
        brand: "GloveMax",
        price: 45,
        stock: 200,
        discount: 5,
        description:
          "Heavy-duty leather safety gloves with reinforced palms. Cut resistant.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Safety Harness Full Body",
        category: "Safety & Security",
        brand: "HarnessPro",
        price: 850,
        stock: 30,
        discount: 15,
        description:
          "Full body safety harness with D-rings. OSHA approved for fall protection.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      // Additional Doors & Windows Products
      {
        name: "Aluminum Window Frame",
        category: "Doors & Windows",
        brand: "AluFrame",
        price: 1200,
        stock: 50,
        discount: 12,
        description:
          "Anodized aluminum window frame with thermal break. Weather resistant.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Steel Security Door",
        category: "Doors & Windows",
        brand: "SecureDoor",
        price: 3500,
        stock: 25,
        discount: 8,
        description:
          "Heavy-duty steel security door with multiple locking points. Fire resistant.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Glass Sliding Door",
        category: "Doors & Windows",
        brand: "GlassDoor",
        price: 2800,
        stock: 20,
        discount: 15,
        description:
          "Tempered glass sliding door with aluminum frame. Smooth operation.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Roofing Materials Products
      {
        name: "Metal Roofing Sheets",
        category: "Roofing Materials",
        brand: "MetalRoof",
        price: 85,
        stock: 300,
        discount: 10,
        description:
          "Galvanized metal roofing sheets with corrugated design. Weather resistant.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Clay Roof Tiles",
        category: "Roofing Materials",
        brand: "ClayTile",
        price: 12,
        stock: 1000,
        discount: 5,
        description:
          "Traditional clay roof tiles with natural finish. Excellent thermal properties.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Roof Insulation Board",
        category: "Roofing Materials",
        brand: "InsulBoard",
        price: 180,
        stock: 80,
        discount: 12,
        description:
          "Thermal insulation board for roofs. Moisture resistant and fire retardant.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Insulation Products
      {
        name: "Spray Foam Insulation Kit",
        category: "Insulation",
        brand: "FoamMax",
        price: 450,
        stock: 60,
        discount: 15,
        description:
          "Two-component spray foam insulation kit. Expands to fill gaps and cracks.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Reflective Insulation Foil",
        category: "Insulation",
        brand: "ReflectMax",
        price: 25,
        stock: 200,
        discount: 8,
        description:
          "Reflective insulation foil for walls and attics. Radiant heat barrier.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Mineral Wool Insulation",
        category: "Insulation",
        brand: "WoolMax",
        price: 95,
        stock: 120,
        discount: 10,
        description:
          "Mineral wool insulation batts. Fire resistant and sound absorbing.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      // Additional Garden & Outdoor Products
      {
        name: "Garden Sprinkler System",
        category: "Garden & Outdoor",
        brand: "SprinklerPro",
        price: 280,
        stock: 40,
        discount: 12,
        description:
          "Automatic garden sprinkler system with timer. Adjustable spray patterns.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Outdoor LED Lights",
        category: "Garden & Outdoor",
        brand: "OutdoorLED",
        price: 150,
        stock: 80,
        discount: 15,
        description:
          "Weatherproof outdoor LED lights with motion sensor. Solar powered option.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Garden Fencing Wire",
        category: "Garden & Outdoor",
        brand: "FenceMax",
        price: 35,
        stock: 150,
        discount: 5,
        description:
          "Galvanized garden fencing wire with PVC coating. Rust resistant.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional Kitchen & Bathroom Products
      {
        name: "Kitchen Sink Stainless Steel",
        category: "Kitchen & Bathroom",
        brand: "SinkMax",
        price: 1200,
        stock: 30,
        discount: 10,
        description:
          "Double bowl stainless steel kitchen sink with drain board. Easy to clean.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Bathroom Vanity Unit",
        category: "Kitchen & Bathroom",
        brand: "VanityPro",
        price: 1800,
        stock: 25,
        discount: 15,
        description:
          "Modern bathroom vanity unit with storage and mirror. Water resistant finish.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Shower Head Rainfall",
        category: "Kitchen & Bathroom",
        brand: "ShowerMax",
        price: 450,
        stock: 60,
        discount: 8,
        description:
          "Rainfall shower head with adjustable settings. Chrome finish and easy installation.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Lumber & Wood Products
      {
        name: "Plywood Sheet 4x8x1/2",
        category: "Lumber & Wood",
        brand: "PlyMax",
        price: 120,
        stock: 100,
        discount: 8,
        description:
          "Marine grade plywood sheet. Water resistant and durable for construction.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Hardwood Flooring Oak",
        category: "Lumber & Wood",
        brand: "HardWood",
        price: 220,
        stock: 80,
        discount: 12,
        description:
          "Solid oak hardwood flooring planks. Pre-finished and ready to install.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Particle Board 4x8x3/4",
        category: "Lumber & Wood",
        brand: "ParticleMax",
        price: 45,
        stock: 150,
        discount: 5,
        description:
          "Medium density particle board for furniture and construction. Smooth surface.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.1,
      },
      // Additional Glass & Mirrors Products
      {
        name: "Mirror 3x4 feet",
        category: "Glass & Mirrors",
        brand: "MirrorMax",
        price: 280,
        stock: 40,
        discount: 10,
        description:
          "Large wall mirror with beveled edges. Silver backing for clear reflection.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Safety Glass 6mm",
        category: "Glass & Mirrors",
        brand: "SafetyGlass",
        price: 95,
        stock: 60,
        discount: 8,
        description:
          "Laminated safety glass with interlayer. Shatter resistant and secure.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Frosted Glass Panel",
        category: "Glass & Mirrors",
        brand: "FrostMax",
        price: 65,
        stock: 80,
        discount: 5,
        description:
          "Frosted glass panel for privacy and decoration. Easy to cut and install.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      // Additional HVAC & Ventilation Products
      {
        name: "Exhaust Fan 12 inch",
        category: "HVAC & Ventilation",
        brand: "ExhaustPro",
        price: 180,
        stock: 60,
        discount: 10,
        description:
          "High-capacity exhaust fan for bathrooms and kitchens. Quiet operation.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Air Conditioner 1.5 Ton",
        category: "HVAC & Ventilation",
        brand: "CoolMax",
        price: 25000,
        stock: 15,
        discount: 20,
        description:
          "Energy-efficient split air conditioner with inverter technology. 5-star rating.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.8,
      },
      {
        name: "Duct Insulation Wrap",
        category: "HVAC & Ventilation",
        brand: "DuctWrap",
        price: 35,
        stock: 100,
        discount: 8,
        description:
          "Thermal insulation wrap for HVAC ducts. Reduces energy loss and condensation.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      // Additional Landscaping Products
      {
        name: "Garden Soil Mix 50kg",
        category: "Landscaping",
        brand: "SoilMax",
        price: 85,
        stock: 200,
        discount: 5,
        description:
          "Premium garden soil mix with organic matter. Perfect for planting and gardening.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Garden Mulch Bark",
        category: "Landscaping",
        brand: "MulchPro",
        price: 45,
        stock: 150,
        discount: 8,
        description:
          "Natural bark mulch for garden beds. Retains moisture and suppresses weeds.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Garden Edging Plastic",
        category: "Landscaping",
        brand: "EdgeMax",
        price: 25,
        stock: 300,
        discount: 10,
        description:
          "Flexible plastic garden edging. Easy to install and maintain clean borders.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.1,
      },
      // Additional Lighting & Fixtures Products
      {
        name: "LED Bulb 9W Warm White",
        category: "Lighting & Fixtures",
        brand: "LEDMax",
        price: 35,
        stock: 200,
        discount: 15,
        description:
          "Energy-efficient LED bulb with warm white light. 10-year warranty.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Track Lighting Kit",
        category: "Lighting & Fixtures",
        brand: "TrackLight",
        price: 450,
        stock: 30,
        discount: 12,
        description:
          "Adjustable track lighting kit with 3 spotlights. Modern and versatile.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Wall Sconce LED",
        category: "Lighting & Fixtures",
        brand: "SconceMax",
        price: 180,
        stock: 50,
        discount: 8,
        description:
          "Modern LED wall sconce with dimmable feature. Perfect for ambient lighting.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Cement & Concrete Products
      {
        name: "White Cement 25kg",
        category: "Cement & Concrete",
        brand: "WhiteCement",
        price: 280,
        stock: 80,
        discount: 8,
        description:
          "Premium white cement for decorative finishes and artistic applications.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Concrete Admixture 1L",
        category: "Cement & Concrete",
        brand: "AdmixPro",
        price: 45,
        stock: 200,
        discount: 10,
        description:
          "Water reducing concrete admixture for improved workability and strength.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Concrete Sealer 5L",
        category: "Cement & Concrete",
        brand: "SealMax",
        price: 180,
        stock: 60,
        discount: 12,
        description:
          "Penetrating concrete sealer for protection against water and stains.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // More Cement & Concrete Products
      {
        name: "Rapid Setting Cement 25kg",
        category: "Cement & Concrete",
        brand: "RapidSet",
        price: 320,
        stock: 75,
        discount: 8,
        description:
          "Fast-setting cement for quick repairs and emergency construction work.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Concrete Mixer 1 Cubic Yard",
        category: "Cement & Concrete",
        brand: "MixMaster",
        price: 2800,
        stock: 25,
        discount: 15,
        description:
          "Professional concrete mixer for large construction projects. High efficiency.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Concrete Vibrator 2HP",
        category: "Cement & Concrete",
        brand: "VibroMax",
        price: 450,
        stock: 40,
        discount: 10,
        description:
          "Heavy-duty concrete vibrator for removing air bubbles and ensuring proper compaction.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Concrete Curing Compound 20L",
        category: "Cement & Concrete",
        brand: "CurePro",
        price: 220,
        stock: 50,
        discount: 12,
        description:
          "Water-based curing compound for proper concrete hydration and strength development.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Concrete Repair Mortar 25kg",
        category: "Cement & Concrete",
        brand: "RepairMax",
        price: 180,
        stock: 90,
        discount: 8,
        description:
          "High-strength repair mortar for fixing cracks and damaged concrete surfaces.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Concrete Formwork Panels 4x8",
        category: "Cement & Concrete",
        brand: "FormPro",
        price: 85,
        stock: 120,
        discount: 5,
        description:
          "Reusable concrete formwork panels for creating smooth concrete surfaces.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Concrete Anchor Bolts M12",
        category: "Cement & Concrete",
        brand: "AnchorMax",
        price: 12,
        stock: 500,
        discount: 8,
        description:
          "Heavy-duty anchor bolts for securing structures to concrete foundations.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Concrete Expansion Joint 10m",
        category: "Cement & Concrete",
        brand: "JointPro",
        price: 35,
        stock: 200,
        discount: 10,
        description:
          "Flexible expansion joint material for preventing concrete cracking due to thermal expansion.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Concrete Fiber Reinforcement 1kg",
        category: "Cement & Concrete",
        brand: "FiberMax",
        price: 25,
        stock: 300,
        discount: 12,
        description:
          "Polypropylene fibers for concrete reinforcement to reduce cracking and improve durability.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Concrete Leveling Compound 20kg",
        category: "Cement & Concrete",
        brand: "LevelPro",
        price: 95,
        stock: 80,
        discount: 8,
        description:
          "Self-leveling compound for creating smooth, flat concrete surfaces before flooring.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Concrete Stain Remover 5L",
        category: "Cement & Concrete",
        brand: "CleanMax",
        price: 65,
        stock: 100,
        discount: 10,
        description:
          "Heavy-duty stain remover for cleaning oil, grease, and other stains from concrete.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      // Additional Steel & Iron Products
      {
        name: "Steel Rods 8mm",
        category: "Steel & Iron",
        brand: "RodMax",
        price: 85,
        stock: 300,
        discount: 5,
        description:
          "High-strength steel rods for reinforcement work. Corrosion resistant.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Steel Channel 4 inch",
        category: "Steel & Iron",
        brand: "ChannelPro",
        price: 220,
        stock: 100,
        discount: 8,
        description:
          "Structural steel channel for framing and support applications.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Steel Plate 6mm",
        category: "Steel & Iron",
        brand: "PlateMax",
        price: 180,
        stock: 80,
        discount: 10,
        description:
          "Heavy-duty steel plate for fabrication and construction projects.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      // Additional Bricks & Blocks Products
      {
        name: "Interlocking Bricks",
        category: "Bricks & Blocks",
        brand: "InterLock",
        price: 18,
        stock: 600,
        discount: 8,
        description:
          "Interlocking bricks for easy installation without mortar. Eco-friendly.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Decorative Bricks",
        category: "Bricks & Blocks",
        brand: "DecoBrick",
        price: 12,
        stock: 400,
        discount: 5,
        description:
          "Decorative bricks for aesthetic wall finishes. Various textures available.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional Tiles & Flooring Products
      {
        name: "Mosaic Tiles Pack",
        category: "Tiles & Flooring",
        brand: "MosaicMax",
        price: 65,
        stock: 150,
        discount: 12,
        description:
          "Decorative mosaic tiles for backsplash and accent walls. Various colors.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Anti-Slip Tiles 30x30cm",
        category: "Tiles & Flooring",
        brand: "AntiSlip",
        price: 55,
        stock: 200,
        discount: 8,
        description:
          "Safety tiles with anti-slip surface for wet areas and outdoor use.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Electrical Products
      {
        name: "Electrical Switch 2-Gang",
        category: "Electrical",
        brand: "SwitchPro",
        price: 85,
        stock: 150,
        discount: 10,
        description:
          "Modern 2-gang electrical switch with LED indicator. Easy installation.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Electrical Panel Box",
        category: "Electrical",
        brand: "PanelMax",
        price: 450,
        stock: 40,
        discount: 15,
        description:
          "Weatherproof electrical panel box for outdoor installations. Lockable.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Cable Tray 6 inch",
        category: "Electrical",
        brand: "CableTray",
        price: 120,
        stock: 80,
        discount: 8,
        description:
          "Galvanized cable tray for organized cable management. Easy installation.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional Plumbing Products
      {
        name: "Water Tank 1000L",
        category: "Plumbing",
        brand: "TankMax",
        price: 3500,
        stock: 25,
        discount: 12,
        description:
          "High-capacity water storage tank with UV protection. Food grade material.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Pipe Fittings Kit",
        category: "Plumbing",
        brand: "FittingPro",
        price: 95,
        stock: 100,
        discount: 10,
        description:
          "Complete pipe fittings kit with various sizes and types. Corrosion resistant.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Water Pump 1HP",
        category: "Plumbing",
        brand: "PumpMax",
        price: 2800,
        stock: 20,
        discount: 15,
        description:
          "High-efficiency water pump for residential use. Energy saving design.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      // Additional Tools & Equipment Products
      {
        name: "Angle Grinder 4 inch",
        category: "Tools & Equipment",
        brand: "GrindMax",
        price: 1200,
        stock: 40,
        discount: 12,
        description:
          "Professional angle grinder with safety features. Variable speed control.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Measuring Tape 25ft",
        category: "Tools & Equipment",
        brand: "MeasurePro",
        price: 45,
        stock: 120,
        discount: 5,
        description:
          "Professional measuring tape with magnetic tip. Durable and accurate.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Cordless Drill 18V",
        category: "Tools & Equipment",
        brand: "CordlessMax",
        price: 3500,
        stock: 25,
        discount: 18,
        description:
          "Heavy-duty cordless drill with lithium battery. Long-lasting power.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      // Additional Paint & Chemicals Products
      {
        name: "Interior Wall Paint 1L",
        category: "Paint & Chemicals",
        brand: "InteriorMax",
        price: 120,
        stock: 200,
        discount: 8,
        description:
          "Premium interior wall paint with washable finish. Low VOC formula.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Paint Thinner 1L",
        category: "Paint & Chemicals",
        brand: "ThinnerPro",
        price: 35,
        stock: 150,
        discount: 5,
        description:
          "High-quality paint thinner for cleaning brushes and thinning paint.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Waterproofing Compound",
        category: "Paint & Chemicals",
        brand: "WaterProof",
        price: 180,
        stock: 80,
        discount: 12,
        description:
          "Liquid waterproofing compound for roofs and basements. Long-lasting protection.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      // Additional Hardware & Fasteners Products
      {
        name: "Hinges Set 4 inch",
        category: "Hardware & Fasteners",
        brand: "HingeMax",
        price: 65,
        stock: 200,
        discount: 8,
        description:
          "Heavy-duty door hinges with ball bearings. Smooth operation guaranteed.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Door Handles Set",
        category: "Hardware & Fasteners",
        brand: "HandlePro",
        price: 180,
        stock: 100,
        discount: 10,
        description:
          "Modern door handles with matching locks. Easy installation included.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Cable Ties Pack 100",
        category: "Hardware & Fasteners",
        brand: "TieMax",
        price: 25,
        stock: 300,
        discount: 5,
        description:
          "Heavy-duty cable ties for organizing wires and cables. UV resistant.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      // Additional Safety & Security Products
      {
        name: "Safety Boots Steel Toe",
        category: "Safety & Security",
        brand: "BootMax",
        price: 450,
        stock: 60,
        discount: 15,
        description:
          "Steel toe safety boots with slip-resistant sole. Comfortable all-day wear.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Safety Vest Reflective",
        category: "Safety & Security",
        brand: "VestPro",
        price: 85,
        stock: 150,
        discount: 8,
        description:
          "High-visibility safety vest with reflective strips. ANSI certified.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "First Aid Kit",
        category: "Safety & Security",
        brand: "AidMax",
        price: 280,
        stock: 40,
        discount: 10,
        description:
          "Complete first aid kit for construction sites. OSHA approved contents.",
        images: [
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      // Additional Doors & Windows Products
      {
        name: "Wooden Window Frame",
        category: "Doors & Windows",
        brand: "WoodFrame",
        price: 1800,
        stock: 30,
        discount: 12,
        description:
          "Solid wood window frame with weather-resistant finish. Custom sizes available.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Window Glass 6mm",
        category: "Doors & Windows",
        brand: "GlassPro",
        price: 95,
        stock: 100,
        discount: 8,
        description:
          "Clear window glass with UV protection. Energy efficient and durable.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Door Lock Set",
        category: "Doors & Windows",
        brand: "LockMax",
        price: 350,
        stock: 80,
        discount: 10,
        description:
          "Complete door lock set with keys. Anti-theft and weather resistant.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      // Additional Roofing Materials Products
      {
        name: "Roof Ventilator",
        category: "Roofing Materials",
        brand: "VentMax",
        price: 450,
        stock: 50,
        discount: 12,
        description:
          "Automatic roof ventilator for proper air circulation. Weather resistant.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Gutter System 10ft",
        category: "Roofing Materials",
        brand: "GutterPro",
        price: 180,
        stock: 80,
        discount: 8,
        description:
          "Complete gutter system with downspouts. Easy installation and maintenance.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Roofing Felt Roll",
        category: "Roofing Materials",
        brand: "FeltMax",
        price: 65,
        stock: 120,
        discount: 5,
        description:
          "Waterproof roofing felt for underlayment. Tear resistant and durable.",
        images: [
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      // Additional Insulation Products
      {
        name: "Foam Board Insulation",
        category: "Insulation",
        brand: "FoamBoard",
        price: 95,
        stock: 100,
        discount: 10,
        description:
          "Rigid foam board insulation for walls and roofs. High R-value.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Bubble Wrap Insulation",
        category: "Insulation",
        brand: "BubbleMax",
        price: 35,
        stock: 200,
        discount: 8,
        description:
          "Reflective bubble wrap insulation. Easy to install and cut.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.1,
      },
      {
        name: "Cavity Wall Insulation",
        category: "Insulation",
        brand: "CavityMax",
        price: 120,
        stock: 80,
        discount: 12,
        description:
          "Blown-in cavity wall insulation. Professional installation recommended.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      // Additional Garden & Outdoor Products
      {
        name: "Garden Tools Set",
        category: "Garden & Outdoor",
        brand: "GardenSet",
        price: 280,
        stock: 60,
        discount: 15,
        description:
          "Complete garden tools set with trowel, rake, and pruning shears.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Outdoor Furniture Set",
        category: "Garden & Outdoor",
        brand: "OutdoorMax",
        price: 1200,
        stock: 20,
        discount: 20,
        description:
          "Weather-resistant outdoor furniture set. Perfect for patios and gardens.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.7,
      },
      {
        name: "Garden Pot Set",
        category: "Garden & Outdoor",
        brand: "PotMax",
        price: 85,
        stock: 150,
        discount: 8,
        description:
          "Decorative garden pots in various sizes. UV resistant and durable.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional Kitchen & Bathroom Products
      {
        name: "Kitchen Cabinet Set",
        category: "Kitchen & Bathroom",
        brand: "CabinetMax",
        price: 4500,
        stock: 15,
        discount: 18,
        description:
          "Modern kitchen cabinet set with soft-close doors. Ready to assemble.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.8,
      },
      {
        name: "Bathroom Mirror Cabinet",
        category: "Kitchen & Bathroom",
        brand: "MirrorCab",
        price: 650,
        stock: 40,
        discount: 12,
        description:
          "LED bathroom mirror cabinet with storage. Fog-free and energy efficient.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Kitchen Faucet Filter",
        category: "Kitchen & Bathroom",
        brand: "FilterMax",
        price: 180,
        stock: 80,
        discount: 10,
        description:
          "Water filter attachment for kitchen faucet. Removes impurities and chlorine.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Lumber & Wood Products
      {
        name: "MDF Board 4x8x1/2",
        category: "Lumber & Wood",
        brand: "MDFMax",
        price: 85,
        stock: 120,
        discount: 8,
        description:
          "Medium density fiberboard for furniture and construction. Smooth finish.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Wood Stain Brush Set",
        category: "Lumber & Wood",
        brand: "BrushPro",
        price: 35,
        stock: 200,
        discount: 5,
        description:
          "Professional brush set for wood staining and finishing. Various sizes.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Wood Glue 500ml",
        category: "Lumber & Wood",
        brand: "GlueMax",
        price: 25,
        stock: 300,
        discount: 8,
        description:
          "High-strength wood glue for furniture assembly. Water resistant formula.",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        ],
        rating: 4.1,
      },
      // Additional Glass & Mirrors Products
      {
        name: "Bathroom Mirror 2x3",
        category: "Glass & Mirrors",
        brand: "BathMirror",
        price: 180,
        stock: 60,
        discount: 10,
        description:
          "Frameless bathroom mirror with beveled edges. Easy wall mounting.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Glass Cutter Tool",
        category: "Glass & Mirrors",
        brand: "CutterPro",
        price: 45,
        stock: 100,
        discount: 5,
        description:
          "Professional glass cutter with tungsten carbide wheel. Precise cutting.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.2,
      },
      {
        name: "Glass Cleaner Kit",
        category: "Glass & Mirrors",
        brand: "CleanMax",
        price: 65,
        stock: 150,
        discount: 8,
        description:
          "Complete glass cleaning kit with squeegee and microfiber cloths.",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      // Additional HVAC & Ventilation Products
      {
        name: "Air Filter 20x25x1",
        category: "HVAC & Ventilation",
        brand: "FilterPro",
        price: 25,
        stock: 200,
        discount: 10,
        description:
          "High-efficiency air filter for HVAC systems. MERV 13 rating.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      {
        name: "Thermostat Digital",
        category: "HVAC & Ventilation",
        brand: "ThermoMax",
        price: 180,
        stock: 80,
        discount: 12,
        description:
          "Programmable digital thermostat with WiFi connectivity. Energy saving.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Duct Tape 2 inch",
        category: "HVAC & Ventilation",
        brand: "DuctTape",
        price: 15,
        stock: 300,
        discount: 5,
        description:
          "Heavy-duty duct tape for sealing and repairs. Weather resistant.",
        images: [
          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop",
        ],
        rating: 4.1,
      },
      // Additional Landscaping Products
      {
        name: "Garden Sprinkler Timer",
        category: "Landscaping",
        brand: "TimerPro",
        price: 95,
        stock: 80,
        discount: 12,
        description:
          "Digital garden sprinkler timer with multiple zones. Water saving features.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Garden Fertilizer 5kg",
        category: "Landscaping",
        brand: "FertilizerMax",
        price: 120,
        stock: 100,
        discount: 8,
        description:
          "Organic garden fertilizer for healthy plant growth. Slow release formula.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.3,
      },
      {
        name: "Garden Trellis 6ft",
        category: "Landscaping",
        brand: "TrellisPro",
        price: 85,
        stock: 60,
        discount: 10,
        description:
          "Decorative garden trellis for climbing plants. Weather resistant wood.",
        images: [
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
      // Additional Lighting & Fixtures Products
      {
        name: "LED Strip Lights 10m",
        category: "Lighting & Fixtures",
        brand: "StripMax",
        price: 280,
        stock: 60,
        discount: 15,
        description:
          "Flexible LED strip lights with remote control. RGB color changing.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.6,
      },
      {
        name: "Pendant Light Modern",
        category: "Lighting & Fixtures",
        brand: "PendantPro",
        price: 450,
        stock: 40,
        discount: 12,
        description:
          "Modern pendant light with adjustable height. Perfect for dining areas.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.5,
      },
      {
        name: "Emergency Light LED",
        category: "Lighting & Fixtures",
        brand: "EmergencyMax",
        price: 180,
        stock: 80,
        discount: 8,
        description:
          "Battery-powered emergency light with auto-charging. 3-hour backup.",
        images: [
          "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop",
        ],
        rating: 4.4,
      },
    ];

    for (const product of products) {
      const exists = await productModel.findOne({ name: product.name });
      if (!exists) {
        // Randomly assign seller
        const randomSellerId =
          sellerIds[Math.floor(Math.random() * sellerIds.length)];
        const seller = await sellerModel.findById(randomSellerId);

        await productModel.create({
          ...product,
          sellerId: randomSellerId,
          slug: product.name.toLowerCase().replace(/\s+/g, "-"),
          shopName: seller.shopInfo.shopName,
        });
        console.log(
          `✅ Product created: ${product.name} (${seller.shopInfo.shopName})`
        );
      }
    }

    console.log("🎉 Database seeded successfully!");
    console.log("");
    console.log("📋 Test Accounts:");
    console.log("👨‍💼 Admin: admin@buildbasket.com / admin123");
    console.log("🏪 Sellers:");
    console.log("   - Build Materials Pro: seller@buildbasket.com / seller123");
    console.log(
      "   - Steel & Hardware Hub: steelhub@buildbasket.com / steel123"
    );
    console.log(
      "   - Electrical Solutions: electrical@buildbasket.com / electrical123"
    );
    console.log(
      "   - Plumbing Masters: plumbing@buildbasket.com / plumbing123"
    );
    console.log("🛒 Customers:");
    console.log("   - Test Customer: customer@buildbasket.com / customer123");
    console.log("   - John Contractor: john@buildbasket.com / john123");
    console.log("   - Sarah Builder: sarah@buildbasket.com / sarah123");
    console.log("   - Mike Engineer: mike@buildbasket.com / mike123");
    console.log("");
    console.log("📊 Data Summary:");
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - ${sellers.length} Sellers`);
    console.log("   - 1 Admin");
    console.log(`   - ${customers.length} Customers`);

    // Create Price Details for Products
    console.log("📊 Creating price details for products...");
    const allProducts = await productModel.find({});

    // Define different locations for variety
    const locations = [
      { state: 'Maharashtra', city: 'Mumbai', region: 'Western' },
      { state: 'Maharashtra', city: 'Pune', region: 'Western' },
      { state: 'Maharashtra', city: 'Nagpur', region: 'Central' },
      { state: 'Delhi', city: 'New Delhi', region: 'Northern' },
      { state: 'Delhi', city: 'Gurgaon', region: 'Northern' },
      { state: 'Karnataka', city: 'Bangalore', region: 'Southern' },
      { state: 'Karnataka', city: 'Mysore', region: 'Southern' },
      { state: 'Tamil Nadu', city: 'Chennai', region: 'Southern' },
      { state: 'Tamil Nadu', city: 'Coimbatore', region: 'Southern' },
      { state: 'Gujarat', city: 'Ahmedabad', region: 'Western' },
      { state: 'Gujarat', city: 'Surat', region: 'Western' },
      { state: 'West Bengal', city: 'Kolkata', region: 'Eastern' },
      { state: 'West Bengal', city: 'Howrah', region: 'Eastern' },
      { state: 'Rajasthan', city: 'Jaipur', region: 'Northern' },
      { state: 'Rajasthan', city: 'Jodhpur', region: 'Northern' },
      { state: 'Uttar Pradesh', city: 'Lucknow', region: 'Northern' },
      { state: 'Uttar Pradesh', city: 'Kanpur', region: 'Northern' },
      { state: 'Andhra Pradesh', city: 'Hyderabad', region: 'Southern' },
      { state: 'Andhra Pradesh', city: 'Vijayawada', region: 'Southern' },
      { state: 'Kerala', city: 'Kochi', region: 'Southern' }
    ];

    for (const product of allProducts) {
      // Generate comprehensive price history for all time periods (1 year = 365 days)
      const priceHistory = [];
      const basePrice = product.price;
      const currentDate = new Date();
      
      // Select a random location for this product
      const location = locations[Math.floor(Math.random() * locations.length)];

      // Generate price data at specific intervals for different time periods
      // 7 days: 7 data points (daily)
      // 1 month: Every 5 days (6 data points)
      // 3 months: Every 7 days (13 data points)
      // 6 months: Every 9 days (20 data points)
      // 1 year: Every 11 days (33 data points)
      
      const intervals = [
        // 7 days - daily data (7 points)
        ...Array.from({ length: 7 }, (_, i) => i),
        
        // 1 month - every 5 days (6 points: 5, 10, 15, 20, 25, 30)
        ...Array.from({ length: 6 }, (_, i) => (i + 1) * 5),
        
        // 3 months - every 7 days (13 points: 37, 44, 51, 58, 65, 72, 79, 86, 93, 100, 107, 114, 121)
        ...Array.from({ length: 13 }, (_, i) => 37 + (i * 7)),
        
        // 6 months - every 9 days (20 points: 128, 137, 146, 155, 164, 173, 182, 191, 200, 209, 218, 227, 236, 245, 254, 263, 272, 281, 290, 299)
        ...Array.from({ length: 20 }, (_, i) => 128 + (i * 9)),
        
        // 1 year - every 11 days (33 points: 308, 319, 330, 341, 352, 363, 374, 385, 396, 407, 418, 429, 440, 451, 462, 473, 484, 495, 506, 517, 528, 539, 550, 561, 572, 583, 594, 605, 616, 627, 638, 649, 660)
        ...Array.from({ length: 33 }, (_, i) => 308 + (i * 11))
      ];

      // Sort intervals and remove duplicates
      const uniqueIntervals = [...new Set(intervals)].sort((a, b) => b - a);

      for (const daysAgo of uniqueIntervals) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - daysAgo);

        // More realistic price variations with seasonal and market factors
        const seasonalFactor = getSeasonalFactor(daysAgo);
        const categoryVolatility = getCategoryVolatility(product.category);
        const trendFactor = 1 + (daysAgo * 0.0001); // Slight upward trend over time
        
        // Add more realistic price variations with occasional significant changes
        let randomVariation;
        
        // 5% chance of significant price change (>10%)
        if (Math.random() < 0.05) {
          const significantChange = (Math.random() - 0.5) * 0.3; // ±15% change
          randomVariation = significantChange;
        } else {
          // Normal variation
          randomVariation = (Math.random() - 0.5) * categoryVolatility;
        }
        
        // Add market events (10% chance of market-driven changes)
        let marketEventFactor = 1;
        if (Math.random() < 0.1) {
          const eventTypes = ['supply_shortage', 'demand_surge', 'raw_material_cost', 'seasonal_demand'];
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          switch (eventType) {
            case 'supply_shortage':
              marketEventFactor = 1.15; // 15% increase
              break;
            case 'demand_surge':
              marketEventFactor = 1.12; // 12% increase
              break;
            case 'raw_material_cost':
              marketEventFactor = 1.08; // 8% increase
              break;
            case 'seasonal_demand':
              marketEventFactor = 1.05; // 5% increase
              break;
          }
        }
        
        const finalVariation = seasonalFactor * trendFactor * marketEventFactor * (1 + randomVariation);
        const price = Math.round(basePrice * finalVariation);
        
        const change =
          daysAgo === 0
            ? 0
            : price -
              (priceHistory[priceHistory.length - 1]?.price || basePrice);
        const changePercent =
          daysAgo === 0
            ? 0
            : (change /
                (priceHistory[priceHistory.length - 1]?.price || basePrice)) *
              100;

        priceHistory.push({
          price,
          date,
          change,
          changePercent: Math.round(changePercent * 100) / 100,
          volume: Math.floor(Math.random() * 1000) + 100,
          marketCondition: getMarketCondition(changePercent)
        });
      }

      const currentPrice = priceHistory[priceHistory.length - 1].price;
      
      // Calculate changes for different periods
      const weeklyChange = currentPrice - (priceHistory[priceHistory.length - 7]?.price || currentPrice);
      const monthlyChange = currentPrice - (priceHistory[priceHistory.length - 30]?.price || currentPrice);
      const quarterlyChange = currentPrice - (priceHistory[priceHistory.length - 90]?.price || currentPrice);
      const yearlyChange = currentPrice - (priceHistory[0]?.price || currentPrice);

      // Calculate comprehensive changes object
      const changes = {
        daily: {
          value: priceHistory[priceHistory.length - 1]?.change || 0,
          percent: priceHistory[priceHistory.length - 1]?.changePercent || 0
        },
        weekly: {
          value: weeklyChange,
          percent: ((weeklyChange / (priceHistory[priceHistory.length - 7]?.price || currentPrice)) * 100)
        },
        monthly: {
          value: monthlyChange,
          percent: ((monthlyChange / (priceHistory[priceHistory.length - 30]?.price || currentPrice)) * 100)
        },
        quarterly: {
          value: quarterlyChange,
          percent: ((quarterlyChange / (priceHistory[priceHistory.length - 90]?.price || currentPrice)) * 100)
        },
        yearly: {
          value: yearlyChange,
          percent: ((yearlyChange / (priceHistory[0]?.price || currentPrice)) * 100)
        }
      };

      // Calculate market indicators
      const prices = priceHistory.map(p => p.price);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance);

      await priceHistoryModel.create({
        productId: product._id,
        location: location, // Add location data
        currentPrice,
        priceHistory,
        marketTrend: changes.weekly.value > 0 ? 'up' : changes.weekly.value < 0 ? 'down' : 'stable',
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: avg
        },
        changes,
        marketIndicators: {
          volatility: Math.round(volatility * 100) / 100,
          supportLevel: prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.1)],
          resistanceLevel: prices.sort((a, b) => a - b)[Math.floor(prices.length * 0.9)],
          trendStrength: volatility < 2 ? 'weak' : volatility < 5 ? 'moderate' : 'strong'
        },
        lastUpdated: new Date()
      });
    }

    // Helper functions for price generation
    function getSeasonalFactor(daysAgo) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const month = date.getMonth();
      
      // Higher prices in monsoon (June-Sept) and winter (Dec-Feb)
      if (month >= 5 && month <= 8) return 1.05; // Monsoon
      if (month === 11 || month <= 1) return 1.03; // Winter
      return 1.0; // Normal season
    }

    function getCategoryVolatility(category) {
      const volatilityMap = {
        'Cement & Concrete': 0.12,
        'Steel & Iron': 0.18,
        'Bricks & Blocks': 0.08,
        'Tiles & Flooring': 0.14,
        'Electrical': 0.20,
        'Plumbing': 0.12,
        'Tools & Equipment': 0.10,
        'Paint & Chemicals': 0.15,
        'Hardware & Fasteners': 0.08,
        'Safety & Security': 0.10,
        'Doors & Windows': 0.12
      };
      return volatilityMap[category] || 0.12;
    }

    function getMarketCondition(changePercent) {
      if (changePercent > 8) return 'bullish';
      if (changePercent < -8) return 'bearish';
      if (Math.abs(changePercent) > 5) return 'volatile';
      if (Math.abs(changePercent) > 2) return 'moderate';
      return 'stable';
    }

    console.log(`   - ${allProducts.length} Price Details`);

    console.log("");
    console.log("🚀 You can now start testing the application!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Export the function
module.exports = seedData;

// Run seeder if called directly
if (require.main === module) {
  seedData();
}
