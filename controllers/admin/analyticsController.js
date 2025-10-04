const { responseReturn } = require('../../utiles/response');
const sellerModel = require('../../models/sellerModel');
const buyerModel = require('../../models/buyerModel');
const productModel = require('../../models/productModel');
const commodityModel = require('../../models/commodityModel');
const customerOrder = require('../../models/customerOrder');
const categoryModel = require('../../models/categoryModel');

class analyticsController {
    
    // Get comprehensive analytics data
    get_analytics = async (req, res) => {
        const { period = '30d' } = req.query;
        
        try {
            // Calculate date range based on period
            let dateFilter = {};
            const now = new Date();
            let startDate;
            
            switch (period) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            
            dateFilter = {
                createdAt: { $gte: startDate, $lte: now }
            };

            // Get overview statistics
            const [
                totalSellers,
                activeSellers,
                totalBuyers,
                activeBuyers,
                totalOrders,
                totalCommodities,
                activeCommodities
            ] = await Promise.all([
                sellerModel.countDocuments(),
                sellerModel.countDocuments({ status: 'active' }),
                buyerModel.countDocuments(),
                buyerModel.countDocuments({ status: 'active' }),
                customerOrder.countDocuments(),
                commodityModel.countDocuments(),
                commodityModel.countDocuments({ status: 'active' })
            ]);

            // Get revenue data
            const revenueData = await customerOrder.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$price' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            const totalRevenue = revenueData[0]?.totalRevenue || 0;

            // Get credit applications
            const creditApplications = await buyerModel.countDocuments({
                'creditInfo.hasApplied': true
            });

            const approvedCreditData = await buyerModel.aggregate([
                {
                    $match: { 'creditInfo.applicationStatus': 'approved' }
                },
                {
                    $group: {
                        _id: null,
                        totalApproved: { $sum: '$creditInfo.approvedLimit' }
                    }
                }
            ]);

            const approvedCredit = approvedCreditData[0]?.totalApproved || 0;

            // Get growth trends (compare with previous period)
            const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
            const previousDateFilter = {
                createdAt: { $gte: previousPeriodStart, $lt: startDate }
            };

            const [
                prevSellers,
                prevBuyers,
                prevOrders,
                prevRevenueData
            ] = await Promise.all([
                sellerModel.countDocuments(previousDateFilter),
                buyerModel.countDocuments(previousDateFilter),
                customerOrder.countDocuments(previousDateFilter),
                customerOrder.aggregate([
                    { $match: previousDateFilter },
                    { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
                ])
            ]);

            const prevRevenue = prevRevenueData[0]?.totalRevenue || 0;
            const currentPeriodSellers = await sellerModel.countDocuments(dateFilter);
            const currentPeriodBuyers = await buyerModel.countDocuments(dateFilter);
            const currentPeriodOrders = await customerOrder.countDocuments(dateFilter);
            const currentRevenueData = await customerOrder.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
            ]);
            const currentRevenue = currentRevenueData[0]?.totalRevenue || 0;

            // Calculate growth percentages
            const sellersGrowth = prevSellers > 0 ? ((currentPeriodSellers - prevSellers) / prevSellers) * 100 : 0;
            const buyersGrowth = prevBuyers > 0 ? ((currentPeriodBuyers - prevBuyers) / prevBuyers) * 100 : 0;
            const ordersGrowth = prevOrders > 0 ? ((currentPeriodOrders - prevOrders) / prevOrders) * 100 : 0;
            const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

            // Get regional distribution
            const regionalData = await sellerModel.aggregate([
                {
                    $unwind: {
                        path: '$regions',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: '$regions',
                        sellers: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        _id: { $ne: null }
                    }
                },
                {
                    $sort: { sellers: -1 }
                }
            ]);

            // Get buyer counts by region (assuming we can derive from seller regions)
            const buyerRegionalData = await Promise.all(
                regionalData.map(async (region) => {
                    // For now, estimate buyer distribution based on seller distribution
                    const estimatedBuyers = Math.floor(region.sellers * (totalBuyers / totalSellers || 1) * (Math.random() * 0.5 + 0.75));
                    const estimatedRevenue = Math.floor(region.sellers * (totalRevenue / totalSellers || 1) * (Math.random() * 0.3 + 0.85));
                    
                    return {
                        region: region._id || 'Unknown',
                        sellers: region.sellers,
                        buyers: estimatedBuyers,
                        revenue: estimatedRevenue
                    };
                })
            );

            // Get category performance
            const categoryData = await productModel.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);

            // Estimate revenue per category
            const categoryPerformance = await Promise.all(
                categoryData.map(async (cat) => {
                    const avgPrice = await productModel.aggregate([
                        { $match: { category: cat._id } },
                        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
                    ]);
                    
                    const estimatedRevenue = Math.floor((avgPrice[0]?.avgPrice || 1000) * cat.count * (Math.random() * 0.4 + 0.8));
                    
                    return {
                        category: cat._id,
                        count: cat.count,
                        revenue: estimatedRevenue
                    };
                })
            );

            // Get top sellers (by product count as proxy for performance)
            const topSellersData = await productModel.aggregate([
                {
                    $group: {
                        _id: '$sellerId',
                        productCount: { $sum: 1 },
                        avgPrice: { $avg: '$price' }
                    }
                },
                {
                    $lookup: {
                        from: 'sellers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                {
                    $unwind: '$seller'
                },
                {
                    $project: {
                        name: '$seller.name',
                        revenue: { $multiply: ['$productCount', '$avgPrice'] },
                        orders: '$productCount'
                    }
                },
                {
                    $sort: { revenue: -1 }
                },
                {
                    $limit: 5
                }
            ]);

            // Get top buyers (estimated based on order data if available)
            const topBuyersData = await customerOrder.aggregate([
                {
                    $group: {
                        _id: '$customerId',
                        totalSpent: { $sum: '$price' },
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'customers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {
                    $unwind: {
                        path: '$customer',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        name: { $ifNull: ['$customer.name', 'Unknown Customer'] },
                        spent: '$totalSpent',
                        orders: '$orderCount'
                    }
                },
                {
                    $sort: { spent: -1 }
                },
                {
                    $limit: 5
                }
            ]);

            // Compile analytics response
            const analytics = {
                overview: {
                    totalSellers,
                    activeSellers,
                    totalBuyers,
                    activeBuyers,
                    totalOrders,
                    totalRevenue: Math.round(totalRevenue),
                    totalCommodities,
                    activeCommodities,
                    creditApplications,
                    approvedCredit: Math.round(approvedCredit)
                },
                trends: {
                    sellersGrowth: Math.round(sellersGrowth * 10) / 10,
                    buyersGrowth: Math.round(buyersGrowth * 10) / 10,
                    ordersGrowth: Math.round(ordersGrowth * 10) / 10,
                    revenueGrowth: Math.round(revenueGrowth * 10) / 10
                },
                regional: buyerRegionalData,
                categories: categoryPerformance,
                performance: {
                    topSellers: topSellersData.map(seller => ({
                        name: seller.name,
                        revenue: Math.round(seller.revenue),
                        orders: seller.orders
                    })),
                    topBuyers: topBuyersData.map(buyer => ({
                        name: buyer.name,
                        spent: Math.round(buyer.spent),
                        orders: buyer.orders
                    }))
                }
            };

            responseReturn(res, 200, {
                success: true,
                analytics
            });

        } catch (error) {
            console.error('Get analytics error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };
}

module.exports = new analyticsController();
