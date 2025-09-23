const { dbConnect } = require("../utiles/db");
const priceHistoryModel = require("../models/priceHistoryModel");
const productModel = require("../models/productModel");

// Generate realistic price history data
function generatePriceHistory(basePrice, days = 365) {
  const history = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Add some realistic price variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const change = currentPrice * variation;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.7); // Don't go below 70% of base price
    currentPrice = Math.min(currentPrice, basePrice * 1.5); // Don't go above 150% of base price

    // Round to nearest 5
    currentPrice = Math.round(currentPrice / 5) * 5;

    const previousPrice = i > 0 ? history[i - 1].price : basePrice;
    const changeAmount = currentPrice - previousPrice;
    const changePercent =
      previousPrice > 0 ? (changeAmount / previousPrice) * 100 : 0;

    history.push({
      price: currentPrice,
      date: date,
      change: changeAmount,
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 100,
    });
  }

  return history;
}

// Calculate metrics for price history
function calculateMetrics(history, currentPrice) {
  if (history.length === 0) return {};

  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Calculate changes
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const totalChange = lastPrice - firstPrice;
  const totalChangePercent =
    firstPrice > 0 ? (totalChange / firstPrice) * 100 : 0;

  // Determine market trend
  let marketTrend = "stable";
  if (totalChangePercent > 10) marketTrend = "up";
  else if (totalChangePercent < -10) marketTrend = "down";

  return {
    min,
    max,
    avg: parseFloat(avg.toFixed(2)),
    totalChange,
    totalChangePercent: parseFloat(totalChangePercent.toFixed(2)),
    marketTrend,
  };
}

// Define diverse location data for different regions
const locationData = [
  // Maharashtra
  { state: "Maharashtra", city: "Mumbai", region: "Western" },
  { state: "Maharashtra", city: "Pune", region: "Western" },
  { state: "Maharashtra", city: "Nagpur", region: "Central" },
  { state: "Maharashtra", city: "Nashik", region: "Western" },
  { state: "Maharashtra", city: "Aurangabad", region: "Central" },

  // Delhi
  { state: "Delhi", city: "New Delhi", region: "Northern" },
  { state: "Delhi", city: "Delhi", region: "Northern" },

  // Karnataka
  { state: "Karnataka", city: "Bangalore", region: "Southern" },
  { state: "Karnataka", city: "Mysore", region: "Southern" },
  { state: "Karnataka", city: "Hubli", region: "Southern" },

  // Tamil Nadu
  { state: "Tamil Nadu", city: "Chennai", region: "Southern" },
  { state: "Tamil Nadu", city: "Coimbatore", region: "Southern" },
  { state: "Tamil Nadu", city: "Madurai", region: "Southern" },

  // Gujarat
  { state: "Gujarat", city: "Ahmedabad", region: "Western" },
  { state: "Gujarat", city: "Surat", region: "Western" },
  { state: "Gujarat", city: "Vadodara", region: "Western" },

  // West Bengal
  { state: "West Bengal", city: "Kolkata", region: "Eastern" },
  { state: "West Bengal", city: "Asansol", region: "Eastern" },

  // Uttar Pradesh
  { state: "Uttar Pradesh", city: "Lucknow", region: "Northern" },
  { state: "Uttar Pradesh", city: "Kanpur", region: "Northern" },
  { state: "Uttar Pradesh", city: "Agra", region: "Northern" },

  // Rajasthan
  { state: "Rajasthan", city: "Jaipur", region: "Northern" },
  { state: "Rajasthan", city: "Jodhpur", region: "Northern" },
  { state: "Rajasthan", city: "Udaipur", region: "Northern" },

  // Andhra Pradesh
  { state: "Andhra Pradesh", city: "Hyderabad", region: "Southern" },
  { state: "Andhra Pradesh", city: "Vishakhapatnam", region: "Southern" },

  // Kerala
  { state: "Kerala", city: "Kochi", region: "Southern" },
  { state: "Kerala", city: "Thiruvananthapuram", region: "Southern" },

  // Punjab
  { state: "Punjab", city: "Chandigarh", region: "Northern" },
  { state: "Punjab", city: "Ludhiana", region: "Northern" },

  // Haryana
  { state: "Haryana", city: "Gurgaon", region: "Northern" },
  { state: "Haryana", city: "Faridabad", region: "Northern" },

  // Madhya Pradesh
  { state: "Madhya Pradesh", city: "Bhopal", region: "Central" },
  { state: "Madhya Pradesh", city: "Indore", region: "Central" },

  // Bihar
  { state: "Bihar", city: "Patna", region: "Eastern" },
  { state: "Bihar", city: "Gaya", region: "Eastern" },

  // Odisha
  { state: "Odisha", city: "Bhubaneswar", region: "Eastern" },
  { state: "Odisha", city: "Cuttack", region: "Eastern" },

  // Assam
  { state: "Assam", city: "Guwahati", region: "Eastern" },
  { state: "Assam", city: "Silchar", region: "Eastern" },
];

// Generate price history with location-specific variations
function generateLocationSpecificPriceHistory(
  basePrice,
  location,
  days = 365,
  productId = null
) {
  const history = [];
  let currentPrice = basePrice;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Enhanced location-specific price multipliers for better graph differences
  const locationMultipliers = {
    // Tier 1 Cities (Most Expensive)
    Mumbai: 1.25, // Financial capital - highest prices
    Delhi: 1.2, // Capital city - high demand
    Bangalore: 1.18, // Tech hub - premium pricing

    // Tier 2 Cities (Moderate-High)
    Chennai: 1.12, // Industrial center
    Hyderabad: 1.1, // Growing tech city
    Pune: 1.08, // Industrial hub near Mumbai
    Kolkata: 1.05, // Eastern commercial center

    // Tier 3 Cities (Moderate)
    Ahmedabad: 1.0, // Base price reference
    Surat: 0.95, // Industrial city
    Vadodara: 0.92, // Manufacturing hub
    Jaipur: 0.9, // Tourist city
    Lucknow: 0.88, // Administrative center

    // Tier 4 Cities (Lower Cost)
    Chandigarh: 0.85, // Planned city
    Gurgaon: 0.82, // Satellite city
    Faridabad: 0.8, // Industrial suburb
    Bhopal: 0.78, // Central India
    Indore: 0.75, // Commercial center

    // Tier 5 Cities (Lowest Cost)
    Patna: 0.7, // Eastern India
    Gaya: 0.68, // Smaller city
    Bhubaneswar: 0.65, // State capital
    Cuttack: 0.62, // Industrial city
    Guwahati: 0.6, // Northeastern city
    Silchar: 0.58, // Remote location

    // Southern Cities
    Kochi: 0.85, // Port city
    Thiruvananthapuram: 0.8, // State capital
    Mysore: 0.75, // Heritage city
    Hubli: 0.7, // Industrial city
    Coimbatore: 0.72, // Textile hub
    Madurai: 0.68, // Cultural center
    Vishakhapatnam: 0.65, // Port city

    // Western Cities
    Jodhpur: 0.75, // Desert city
    Udaipur: 0.78, // Tourist destination
    Ludhiana: 0.7, // Industrial city
    Aurangabad: 0.65, // Historical city
    Nagpur: 0.68, // Orange city
    Nashik: 0.72, // Wine city
    Asansol: 0.6, // Industrial city

    default: 0.55, // Other smaller cities
  };

  const multiplier =
    locationMultipliers[location.city] || locationMultipliers["default"];
  const adjustedBasePrice = basePrice * multiplier;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Add location-specific and seasonal variations with enhanced realism
    const seasonalVariation = getSeasonalVariation(date, location.region);

    // Enhanced random variation based on city tier with guaranteed changes
    let randomVariation;
    if (
      location.city === "Mumbai" ||
      location.city === "Delhi" ||
      location.city === "Bangalore"
    ) {
      // Tier 1 cities have more volatile prices
      randomVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
    } else if (
      location.city === "Chennai" ||
      location.city === "Hyderabad" ||
      location.city === "Pune"
    ) {
      // Tier 2 cities have moderate volatility
      randomVariation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
    } else {
      // Other cities have guaranteed minimum volatility
      randomVariation = (Math.random() - 0.5) * 0.12; // ±6% variation (increased from 5%)
    }

    // Add trend momentum (prices tend to continue in same direction)
    const trendMomentum =
      i > 0 ? (history[i - 1].changePercent / 100) * 0.15 : 0;

    // Add daily market fluctuations for more regular changes
    const dailyFluctuation = Math.sin(i * 0.2) * 0.05; // ±5% daily cycle (increased)

    // Add weekly patterns (higher prices on weekdays, lower on weekends)
    const dayOfWeek = date.getDay();
    const weeklyPattern = dayOfWeek >= 1 && dayOfWeek <= 5 ? 0.02 : -0.02; // +2% weekdays, -2% weekends (increased)

    // Add monthly patterns for more regular long-term changes
    const dayOfMonth = date.getDate();
    const monthlyPattern = Math.sin((dayOfMonth / 30) * Math.PI * 2) * 0.05; // ±5% monthly cycle (increased)

    // Add product-specific volatility based on product type
    const productSeed = productId ? productId.toString().charCodeAt(0) : 0;
    const productVolatility = Math.sin(i * 0.15 + productSeed) * 0.03; // ±3% product-specific cycle

    const variation =
      seasonalVariation +
      randomVariation +
      trendMomentum +
      dailyFluctuation +
      weeklyPattern +
      monthlyPattern +
      productVolatility;
    const change = adjustedBasePrice * variation;

    // More realistic price bounds
    currentPrice = Math.max(currentPrice + change, adjustedBasePrice * 0.5); // Can go down to 50%
    currentPrice = Math.min(currentPrice, adjustedBasePrice * 2.0); // Can go up to 200%

    // Ensure minimum daily price change for more regular updates
    if (i > 0) {
      const minChange = adjustedBasePrice * 0.01; // Minimum 1% change per day (increased)
      const maxChange = adjustedBasePrice * 0.08; // Maximum 8% change per day (increased)

      // Always ensure a minimum change - force change if too small
      const actualChange = currentPrice - history[i - 1].price;
      if (Math.abs(actualChange) < minChange) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        currentPrice = history[i - 1].price + direction * minChange;
      }

      // If change is too large, cap it
      if (Math.abs(currentPrice - history[i - 1].price) > maxChange) {
        const direction = currentPrice > history[i - 1].price ? 1 : -1;
        currentPrice = history[i - 1].price + direction * maxChange;
      }
    }

    // Round to nearest 5
    currentPrice = Math.round(currentPrice / 5) * 5;

    const previousPrice = i > 0 ? history[i - 1].price : adjustedBasePrice;
    const changeAmount = currentPrice - previousPrice;
    const changePercent =
      previousPrice > 0 ? (changeAmount / previousPrice) * 100 : 0;

    history.push({
      price: currentPrice,
      date: date,
      change: changeAmount,
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 100,
      marketCondition: getMarketCondition(changePercent),
    });
  }

  return history;
}

// Enhanced seasonal variation based on region for more dramatic differences
function getSeasonalVariation(date, region) {
  const month = date.getMonth();

  // Monsoon season (June-September) affects construction materials significantly
  const isMonsoon = month >= 5 && month <= 8;

  // Winter season (December-February) affects some materials
  const isWinter = month === 11 || month <= 1;

  // Summer season (March-May) - peak construction season
  const isSummer = month >= 2 && month <= 4;

  // Post-monsoon (October-November) - recovery period
  const isPostMonsoon = month >= 9 && month <= 10;

  switch (region) {
    case "Western":
      // Maharashtra, Gujarat - heavy monsoon impact
      if (isMonsoon) return 0.12; // +12% during monsoon
      if (isSummer) return -0.05; // -5% during summer (high supply)
      if (isWinter) return 0.03; // +3% during winter
      if (isPostMonsoon) return 0.08; // +8% recovery
      return 0;

    case "Southern":
      // Tamil Nadu, Karnataka, Kerala - heavy monsoon impact
      if (isMonsoon) return 0.15; // +15% during monsoon
      if (isSummer) return -0.08; // -8% during summer
      if (isWinter) return 0.02; // +2% during winter
      if (isPostMonsoon) return 0.1; // +10% recovery
      return 0;

    case "Northern":
      // Delhi, Punjab, Haryana - moderate monsoon, harsh winter
      if (isMonsoon) return 0.08; // +8% during monsoon
      if (isSummer) return -0.03; // -3% during summer
      if (isWinter) return 0.06; // +6% during winter (heating costs)
      if (isPostMonsoon) return 0.05; // +5% recovery
      return 0;

    case "Eastern":
      // West Bengal, Odisha, Assam - heavy monsoon impact
      if (isMonsoon) return 0.18; // +18% during monsoon
      if (isSummer) return -0.1; // -10% during summer
      if (isWinter) return 0.04; // +4% during winter
      if (isPostMonsoon) return 0.12; // +12% recovery
      return 0;

    case "Central":
      // Madhya Pradesh, Chhattisgarh - moderate impact
      if (isMonsoon) return 0.1; // +10% during monsoon
      if (isSummer) return -0.06; // -6% during summer
      if (isWinter) return 0.05; // +5% during winter
      if (isPostMonsoon) return 0.07; // +7% recovery
      return 0;

    default:
      return 0;
  }
}

// Enhanced market condition based on price change for better differentiation and regular changes
function getMarketCondition(changePercent) {
  if (changePercent > 6) return "bullish";
  if (changePercent < -6) return "bearish";
  if (Math.abs(changePercent) > 3) return "volatile";
  if (Math.abs(changePercent) > 0.5) return "moderate";
  return "stable";
}

async function seedPriceHistory() {
  try {
    await dbConnect();
    console.log("✅ Database connected");

    // Get all products
    const products = await productModel.find({});
    console.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      console.log("❌ No products found. Please seed products first.");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Clear existing price history data
    await priceHistoryModel.deleteMany({});
    console.log("🗑️  Cleared existing price history data");

    for (const product of products) {
      try {
        // Create price history for multiple locations
        for (const location of locationData) {
          // Generate location-specific price history
          const priceHistory = generateLocationSpecificPriceHistory(
            product.price,
            location,
            365,
            product._id
          );
          const metrics = calculateMetrics(priceHistory, product.price);

          // Create price history document for this location
          const priceHistoryDoc = new priceHistoryModel({
            productId: product._id,
            currentPrice: priceHistory[priceHistory.length - 1].price,
            priceHistory: priceHistory,
            marketTrend: metrics.marketTrend,
            lastUpdated: new Date(),
            priceRange: {
              min: metrics.min,
              max: metrics.max,
              avg: metrics.avg,
            },
            changes: {
              daily: { value: 0, percent: 0 },
              weekly: { value: 0, percent: 0 },
              monthly: { value: 0, percent: 0 },
              quarterly: { value: 0, percent: 0 },
              yearly: {
                value: metrics.totalChangePercent,
                percent: metrics.totalChangePercent,
              },
            },
            marketIndicators: {
              volatility: calculateVolatility(priceHistory),
              supportLevel: calculateSupportLevel(priceHistory),
              resistanceLevel: calculateResistanceLevel(priceHistory),
              trendStrength: calculateTrendStrength(priceHistory),
            },
            location: {
              state: location.state,
              city: location.city,
              region: location.region,
            },
          });

          await priceHistoryDoc.save();
        }

        console.log(
          `✅ Created price history for ${product.name} across ${locationData.length} locations`
        );
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error creating price history for ${product.name}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n🎉 Price History Seeding Complete!");
    console.log(
      `✅ Successfully created: ${successCount} products with price history`
    );
    console.log(`❌ Errors: ${errorCount}`);

    // Verify the data
    const totalPriceHistories = await priceHistoryModel.countDocuments();
    console.log(`📊 Total price histories in database: ${totalPriceHistories}`);

    // Show location distribution
    const locationStats = await priceHistoryModel.aggregate([
      {
        $group: {
          _id: { state: "$location.state", city: "$location.city" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    console.log("\n📍 Top 10 Locations by Price History Count:");
    locationStats.forEach((stat) => {
      console.log(
        `   ${stat._id.state} - ${stat._id.city}: ${stat.count} records`
      );
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    process.exit(0);
  }
}

// Calculate volatility
function calculateVolatility(priceHistory) {
  if (priceHistory.length < 2) return 0;

  const prices = priceHistory.map((p) => p.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance =
    prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) /
    prices.length;

  return Math.round(Math.sqrt(variance) * 100) / 100;
}

// Calculate support level (10th percentile)
function calculateSupportLevel(priceHistory) {
  const prices = priceHistory.map((p) => p.price).sort((a, b) => a - b);
  const index = Math.floor(prices.length * 0.1);
  return prices[index] || 0;
}


// Calculate resistance level (90th percentile)
function calculateResistanceLevel(priceHistory) {
  const prices = priceHistory.map((p) => p.price).sort((a, b) => a - b);
  const index = Math.floor(prices.length * 0.9);
  return prices[index] || 0;
}

// Calculate trend strength
function calculateTrendStrength(priceHistory) {
  const volatility = calculateVolatility(priceHistory);

  if (volatility < 2) return "weak";
  if (volatility < 5) return "moderate";
  return "strong";
}

// Run the seeder
seedPriceHistory();
