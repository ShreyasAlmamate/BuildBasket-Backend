const categoryModel = require('../../models/categoryModel')
const productModel = require('../../models/productModel')
const reviewModel = require('../../models/reviewModel')
const priceHistoryModel = require('../../models/priceHistoryModel')
const { responseReturn } = require("../../utiles/response")
const queryProducts = require('../../utiles/queryProducts')
const moment = require('moment')
const { mongo: {ObjectId}} = require('mongoose')
const { calculateCommissionSync } = require('../../utiles/commissionUtils')

class homeControllers{

    formateProduct = (products) => {
        const productArray = [];
        let i = 0;
        while (i < products.length ) {
            let temp = []
            let j = i
            while (j < i + 3) {
                if (products[j]) {
                    temp.push(products[j])
                }
                j++
            }
            productArray.push([...temp])
            i = j
        }
        return productArray
    }

    // Format products with commission information
    formateProductWithCommission = (products) => {
        const productArray = [];
        let i = 0;
        while (i < products.length ) {
            let temp = []
            let j = i
            while (j < i + 3) {
                if (products[j]) {
                    const product = products[j].toObject();
                    
                    // Use stored commission data if available, otherwise calculate
                    if (product.finalPrice && product.commissionAmount !== undefined) {
                        // Use stored commission data
                        product.commissionInfo = {
                            basePrice: product.price,
                            commissionAmount: product.commissionAmount,
                            finalPrice: product.finalPrice,
                            commissionType: product.commissionType || 'fixed'
                        };
                    } else {
                        // Calculate commission (fallback for products without stored data)
                        const commissionInfo = calculateCommissionSync(product.price);
                        product.commissionInfo = commissionInfo;
                        product.finalPrice = commissionInfo.finalPrice;
                        product.commissionAmount = commissionInfo.commissionAmount;
                    }

                    temp.push(product)
                }
                j++
            }
            productArray.push([...temp])
            i = j
        }
        return productArray
    }

    get_categorys = async(req,res) => {
        try {
            const categorys = await categoryModel.find({})
            responseReturn(res,200, {
                categorys
            })
            
        } catch (error) {
            console.log(error.message)
        }
    }
    // end method 

    get_products = async(req, res) => {
        try {
            console.log('Fetching products for homepage...');
            
            const products = await productModel.find({ status: 'active' }).limit(12).sort({
                createdAt: -1
            })
            const allProduct1 = await productModel.find({ status: 'active' }).limit(9).sort({
                createdAt: -1
            })
            const latest_product = this.formateProductWithCommission(allProduct1);
            
            const allProduct2 = await productModel.find({ status: 'active' }).limit(9).sort({
                rating: -1
            })
            const topRated_product = this.formateProductWithCommission(allProduct2);
           
            const allProduct3 = await productModel.find({ status: 'active' }).limit(9).sort({
                discount: -1
            })
            const discount_product = this.formateProductWithCommission(allProduct3);

            console.log(`Homepage API - Total products: ${products.length}`);
            console.log(`Homepage API - Latest products: ${allProduct1.length}`);
            console.log(`Homepage API - Top rated products: ${allProduct2.length}`);
            console.log(`Homepage API - Discount products: ${allProduct3.length}`);

            // Log sample products
            if (products.length > 0) {
                console.log('Sample homepage products:', products.slice(0, 2).map(p => ({
                    id: p._id,
                    name: p.name,
                    status: p.status,
                    createdAt: p.createdAt
                })));
            }

            responseReturn(res, 200,{
                products,
                latest_product,
                topRated_product,
                discount_product
            })
            
        } catch (error) {
            console.log('Error in get_products:', error.message)
            responseReturn(res, 500, { message: 'Error fetching products', error: error.message });
        }
    }
   // end method 

   price_range_product = async (req, res) => {
    try {
        const priceRange = {
            low: 0,
            high: 0,
        }
        const products = await productModel.find({ status: 'active' }).limit(9).sort({
            createdAt: -1 // 1 for asc -1 is for Desc
        })
        const latest_product = this.formateProduct(products);
        const getForPrice = await productModel.find({ status: 'active' }).sort({
            'price': 1
        })
        if (getForPrice.length > 0) {
            priceRange.high = getForPrice[getForPrice.length - 1].price
            priceRange.low = getForPrice[0].price
        }
        responseReturn(res, 200, {
            latest_product,
            priceRange
        })
        
    } catch (error) {
        console.log(error.message)
    }

   }

// end method 

query_products = async (req, res) => {
    const parPage = 12
    req.query.parPage = parPage

    try {
        console.log('Shops page query_products called...');
        
        // Decode URL parameters
        if (req.query.category) {
            req.query.category = decodeURIComponent(req.query.category);
        }
        if (req.query.searchValue) {
            req.query.searchValue = decodeURIComponent(req.query.searchValue);
        }
        
        const products = await productModel.find({ status: 'active' }).sort({
            createdAt: -1
        })
        
        console.log(`Shops API - Total active products: ${products.length}`);
        console.log(`Shops API - Query parameters:`, req.query);
        
        // Log some sample products
        if (products.length > 0) {
            console.log('Shops API - Sample products:', products.slice(0, 3).map(p => ({
                id: p._id,
                name: p.name,
                category: p.category,
                brand: p.brand,
                status: p.status,
                createdAt: p.createdAt
            })));
        }
        
        const totalProduct = new queryProducts(products, req.query).categoryQuery().ratingQuery().searchQuery().priceQuery().sortByPrice().countProducts();

        const result = new queryProducts(products, req.query).categoryQuery().ratingQuery().priceQuery().searchQuery().sortByPrice().skip().limit().getProducts();
        
        console.log(`Shops API - Filtered products count: ${result.length}`);
        
        // Log filtered results
        if (result.length > 0) {
            console.log('Shops API - Filtered sample products:', result.slice(0, 2).map(p => ({
                id: p._id,
                name: p.name,
                category: p.category,
                status: p.status
            })));
        }
        
        // Add commission information to each product
        const productsWithCommission = result.map(product => {
            const productObj = product.toObject();
            const commissionInfo = calculateCommissionSync(productObj.price);
            
            productObj.commissionInfo = commissionInfo;
            productObj.finalPrice = commissionInfo.finalPrice;
            productObj.commissionAmount = commissionInfo.commissionAmount;
            
            return productObj;
        });

        responseReturn(res, 200, {
            products: productsWithCommission,
            totalProduct,
            parPage
        })

        
    } catch (error) {
        console.log('❌ Query Products Error:', error.message)
        responseReturn(res, 500, { message: 'Error querying products', error: error.message });
    }
 
}
// end method 

product_details = async (req, res) => {
    const { slug } = req.params
    try {
        const product = await productModel.findOne({slug})
        
        // Get price history data for the product
        let priceHistory = await priceHistoryModel.findOne({ productId: product._id });
        
        // If no price history exists, create default one
        if (!priceHistory) {
            // Create default price history similar to the seeder
            const priceHistoryData = [];
            const basePrice = product.price;
            const currentDate = new Date();
            
            // Default location
            const location = {
                state: 'Maharashtra',
                city: 'Mumbai', 
                region: 'Western'
            };

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

                const seasonalFactor = this.getSeasonalFactor(daysAgo);
                const categoryVolatility = this.getCategoryVolatility(product.category);
                const trendFactor = 1 + (daysAgo * 0.0001);
                
                let randomVariation;
                if (Math.random() < 0.05) {
                    const significantChange = (Math.random() - 0.5) * 0.3;
                    randomVariation = significantChange;
                } else {
                    randomVariation = (Math.random() - 0.5) * categoryVolatility;
                }
                
                let marketEventFactor = 1;
                if (Math.random() < 0.1) {
                    const eventTypes = ['supply_shortage', 'demand_surge', 'raw_material_cost', 'seasonal_demand'];
                    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                    
                    switch (eventType) {
                        case 'supply_shortage': marketEventFactor = 1.15; break;
                        case 'demand_surge': marketEventFactor = 1.12; break;
                        case 'raw_material_cost': marketEventFactor = 1.08; break;
                        case 'seasonal_demand': marketEventFactor = 1.05; break;
                    }
                }
                
                const finalVariation = seasonalFactor * trendFactor * marketEventFactor * (1 + randomVariation);
                const price = Math.round(basePrice * finalVariation);
                
                const change = daysAgo === 0 ? 0 : price - (priceHistoryData[priceHistoryData.length - 1]?.price || basePrice);
                const changePercent = daysAgo === 0 ? 0 : ((change / (priceHistoryData[priceHistoryData.length - 1]?.price || basePrice)) * 100);

                priceHistoryData.push({
                    price,
                    date,
                    change,
                    changePercent: Math.round(changePercent * 100) / 100,
                    volume: Math.floor(Math.random() * 1000) + 100,
                    marketCondition: this.getMarketCondition(changePercent)
                });
            }

            const currentPrice = priceHistoryData[priceHistoryData.length - 1].price;
            const weeklyChange = currentPrice - (priceHistoryData[priceHistoryData.length - 7]?.price || currentPrice);
            const monthlyChange = currentPrice - (priceHistoryData[priceHistoryData.length - 30]?.price || currentPrice);

            const changes = {
                daily: { value: priceHistoryData[priceHistoryData.length - 1]?.change || 0, percent: priceHistoryData[priceHistoryData.length - 1]?.changePercent || 0 },
                weekly: { value: weeklyChange, percent: ((weeklyChange / (priceHistoryData[priceHistoryData.length - 7]?.price || currentPrice)) * 100) },
                monthly: { value: monthlyChange, percent: ((monthlyChange / (priceHistoryData[priceHistoryData.length - 30]?.price || currentPrice)) * 100) }
            };

            const prices = priceHistoryData.map(p => p.price);
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
            const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
            const volatility = Math.sqrt(variance);

            priceHistory = await priceHistoryModel.create({
                productId: product._id,
                location: location, // Add location data
                currentPrice,
                priceHistory: priceHistoryData,
                marketTrend: changes.weekly.value > 0 ? 'up' : changes.weekly.value < 0 ? 'down' : 'stable',
                priceRange: { min: Math.min(...prices), max: Math.max(...prices), avg: avg },
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

        // Add price history to product object
        const productWithPriceHistory = {
            ...product.toObject(),
            priceHistory: priceHistory
        };
        
        const relatedProducts = await productModel.find({
            $and: [{
                _id: {
                    $ne: product.id
                }
            },
            {
                category: {
                    $eq: product.category 
                }
            }
           ]
        }).limit(12)
        const moreProducts = await productModel.find({
            $and: [{
                _id: {
                    $ne: product.id
                }
            },
            {
                sellerId: {
                    $eq: product.sellerId
                }
            }
           ]
        }).limit(3)
        responseReturn(res, 200, {
            product: productWithPriceHistory,
            relatedProducts,
            moreProducts
        })

    } catch (error) {
        console.log(error.message)
    }
}

// Helper methods for price generation
getSeasonalFactor = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const month = date.getMonth();
    
    // Higher prices in monsoon (June-Sept) and winter (Dec-Feb)
    if (month >= 5 && month <= 8) return 1.05; // Monsoon
    if (month === 11 || month <= 1) return 1.03; // Winter
    return 1.0; // Normal season
}

getCategoryVolatility = (category) => {
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

getMarketCondition = (changePercent) => {
    if (changePercent > 8) return 'bullish';
    if (changePercent < -8) return 'bearish';
    if (Math.abs(changePercent) > 5) return 'volatile';
    if (Math.abs(changePercent) > 2) return 'moderate';
    return 'stable';
}
// end method 

submit_review = async (req, res) => {
     const {productId,rating,review,name} = req.body

     try {
        await reviewModel.create({
            productId,
            name,
            rating,
            review,
            date: moment(Date.now()).format('LL')
        })

        let rat = 0;
        const reviews = await reviewModel.find({
            productId
        })
        for (let i = 0; i < reviews.length; i++) {
            rat = rat + reviews[i].rating 
        }
        let productRating = 0
        if (reviews.length !== 0) {
            productRating = (rat / reviews.length).toFixed(1)
        }

        await productModel.findByIdAndUpdate(productId,{
            rating : productRating
        })
        responseReturn(res, 201, {
            message: "Review Added Successfully"
        })

        
     } catch (error) {
        console.log(error.message)
     }
}
// end method 

get_reviews = async (req, res) => {
    const {productId} = req.params
    let {pageNo} = req.query 
    pageNo = parseInt(pageNo)
    const limit = 5
    const skipPage = limit * (pageNo - 1) 

    try {
        let getRating = await reviewModel.aggregate([{
            $match: {
                productId: {
                    $eq : new ObjectId(productId)
                },
                rating: {
                    $not: {
                        $size: 0
                    }
                }
            }
        },
        {
            $unwind: "$rating"
        },
        {
            $group: {
                _id: "$rating",
                count: {
                    $sum: 1
                }
            }
        } 
    ])
    let rating_review = [{
        rating: 5,
        sum : 0
    },
    {
        rating: 4,
        sum: 0
    },
    {
        rating: 3,
        sum: 0
    },
    {
        rating: 2,
        sum: 0
    },
    {
        rating: 1,
        sum: 0
    }
   ]
   for (let i = 0; i < rating_review.length; i++) {
        for (let j = 0; j < getRating.length; j++) {
            if (rating_review[i].rating === getRating[j]._id) {
                rating_review[i].sum = getRating[j].count
                break
            } 
        }  
   }

   const getAll = await reviewModel.find({
    productId
   })
   const reviews = await reviewModel.find({
    productId
   }).skip(skipPage).limit(limit).sort({createdAt: -1})

   responseReturn(res, 200, {
    reviews,
    totalReview: getAll.length,
    rating_review
   })
        
    } catch (error) {
        console.log(error.message)
    }
}
// end method

get_product_by_id = async (req, res) => {
    const {productId} = req.params
    try {
        const product = await productModel.findById(productId).populate('category')
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
        res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        responseReturn(res,500,{error: error.message})
    }
}
// end method

}

module.exports = new homeControllers()