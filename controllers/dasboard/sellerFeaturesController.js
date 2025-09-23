const { responseReturn } = require("../../utiles/response");
const sellerModel = require('../../models/sellerModel');
const sellerWalletModel = require('../../models/sellerWallet');
const orderModel = require('../../models/authOrder');
const productModel = require('../../models/productModel');

class sellerFeaturesController {
    
    // Get seller regions
    get_seller_regions = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const seller = await sellerModel.findById(sellerId).select('regions regionFares');
            
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            // Convert regionFares array to object for easier frontend handling
            const regionFaresObj = {};
            if (seller.regionFares && seller.regionFares.length > 0) {
                seller.regionFares.forEach(rf => {
                    regionFaresObj[rf.region] = rf.fare;
                });
            }

            responseReturn(res, 200, {
                success: true,
                regions: seller.regions || [],
                regionFares: regionFaresObj
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Add seller region
    add_seller_region = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { region } = req.body;

            if (!region) {
                return responseReturn(res, 400, { message: 'Region is required' });
            }

            const seller = await sellerModel.findById(sellerId);
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            // Check if region already exists
            if (seller.regions && seller.regions.includes(region)) {
                return responseReturn(res, 400, { message: 'Region already exists' });
            }

            // Add region
            seller.regions = seller.regions || [];
            seller.regions.push(region);

            await seller.save();

            responseReturn(res, 200, {
                success: true,
                message: 'Region added successfully',
                regions: seller.regions
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Remove seller region
    remove_seller_region = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { region } = req.params;

            const seller = await sellerModel.findById(sellerId);
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            // Remove region and its fare
            seller.regions = seller.regions ? seller.regions.filter(r => r !== region) : [];
            seller.regionFares = seller.regionFares ? seller.regionFares.filter(rf => rf.region !== region) : [];

            await seller.save();

            responseReturn(res, 200, {
                success: true,
                message: 'Region removed successfully',
                regions: seller.regions
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Update region fare
    update_region_fare = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { region } = req.params;
            const { fare } = req.body;

            if (!fare || isNaN(fare) || fare < 0) {
                return responseReturn(res, 400, { message: 'Valid fare amount is required' });
            }

            const seller = await sellerModel.findById(sellerId);
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            // Check if region exists
            if (!seller.regions || !seller.regions.includes(region)) {
                return responseReturn(res, 400, { message: 'Region not found in seller regions' });
            }

            // Update or add fare
            seller.regionFares = seller.regionFares || [];
            const existingFareIndex = seller.regionFares.findIndex(rf => rf.region === region);
            
            if (existingFareIndex >= 0) {
                seller.regionFares[existingFareIndex].fare = parseFloat(fare);
            } else {
                seller.regionFares.push({
                    region: region,
                    fare: parseFloat(fare)
                });
            }

            await seller.save();

            responseReturn(res, 200, {
                success: true,
                message: 'Fare updated successfully',
                regionFares: seller.regionFares
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Update GST rate
    update_gst_rate = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { gstRate } = req.body;

            if (gstRate === undefined || gstRate < 0 || gstRate > 100) {
                return responseReturn(res, 400, { message: 'Valid GST rate (0-100) is required' });
            }

            const seller = await sellerModel.findById(sellerId);
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            seller.gstRate = parseFloat(gstRate);
            await seller.save();

            responseReturn(res, 200, {
                success: true,
                message: 'GST rate updated successfully',
                gstRate: seller.gstRate
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Get seller wallet
    get_seller_wallet = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const seller = await sellerModel.findById(sellerId).select('paymentMethod');
            
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            // Get current month/year for wallet calculation
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            // Calculate wallet balance from orders
            const orders = await orderModel.find({
                sellerId: sellerId,
                payment_status: 'paid'
            });

            let totalBalance = 0;
            let totalCommission = 0;
            let totalGST = 0;

            orders.forEach(order => {
                totalBalance += order.price || 0;
                // Assuming 10% commission for now - this should come from commission settings
                totalCommission += (order.price || 0) * 0.1;
                // Calculate GST (assuming seller's GST rate)
                totalGST += (order.price || 0) * (seller.gstRate || 18) / 100;
            });

            const netBalance = totalBalance - totalCommission;

            responseReturn(res, 200, {
                success: true,
                balance: netBalance,
                totalRevenue: totalBalance,
                commission: totalCommission,
                gst: totalGST,
                paymentMethod: seller.paymentMethod || 'direct'
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Update payment method
    update_payment_method = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { paymentMethod } = req.body;

            if (!paymentMethod || !['direct', 'sg_finserv'].includes(paymentMethod)) {
                return responseReturn(res, 400, { message: 'Valid payment method is required (direct or sg_finserv)' });
            }

            const seller = await sellerModel.findById(sellerId);
            if (!seller) {
                return responseReturn(res, 404, { message: 'Seller not found' });
            }

            seller.paymentMethod = paymentMethod;
            await seller.save();

            responseReturn(res, 200, {
                success: true,
                message: 'Payment method updated successfully',
                paymentMethod: seller.paymentMethod
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Get seller analytics
    get_seller_analytics = async (req, res) => {
        try {
            const sellerId = req.seller.id;

            // Get orders for analytics
            const orders = await orderModel.find({
                sellerId: sellerId,
                payment_status: 'paid'
            }).populate('products.productId');

            // Calculate top commodities
            const commodityStats = {};
            let totalRevenue = 0;
            let totalCommission = 0;
            let totalGST = 0;

            orders.forEach(order => {
                totalRevenue += order.price || 0;
                totalCommission += (order.price || 0) * 0.1; // 10% commission
                
                if (order.products && order.products.length > 0) {
                    order.products.forEach(item => {
                        if (item.productId) {
                            const productName = item.productId.name;
                            if (!commodityStats[productName]) {
                                commodityStats[productName] = {
                                    name: productName,
                                    quantity: 0,
                                    revenue: 0
                                };
                            }
                            commodityStats[productName].quantity += item.quantity || 1;
                            commodityStats[productName].revenue += (item.price || 0) * (item.quantity || 1);
                        }
                    });
                }
            });

            // Sort commodities by revenue
            const topCommodities = Object.values(commodityStats)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // Calculate regional performance (mock data for now)
            const topRegions = [
                { name: 'North India', revenue: totalRevenue * 0.3 },
                { name: 'South India', revenue: totalRevenue * 0.25 },
                { name: 'East India', revenue: totalRevenue * 0.2 },
                { name: 'West India', revenue: totalRevenue * 0.15 },
                { name: 'Central India', revenue: totalRevenue * 0.1 }
            ].filter(region => region.revenue > 0);

            // Revenue breakdown
            const revenueBreakdown = {
                total: totalRevenue,
                commission: totalCommission,
                gst: totalGST,
                profit: totalRevenue - totalCommission
            };

            responseReturn(res, 200, {
                success: true,
                analytics: {
                    topCommodities,
                    topRegions,
                    revenueBreakdown,
                    salesPerformance: {
                        totalOrders: orders.length,
                        totalRevenue,
                        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
                    }
                }
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Update order status
    update_order_status = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { orderId } = req.params;
            const { delivery_status } = req.body;

            if (!delivery_status || !['processing', 'shipped', 'delivered'].includes(delivery_status)) {
                return responseReturn(res, 400, { message: 'Valid delivery status is required' });
            }

            const order = await orderModel.findOne({
                _id: orderId,
                sellerId: sellerId
            });

            if (!order) {
                return responseReturn(res, 404, { message: 'Order not found' });
            }

            order.delivery_status = delivery_status;
            await order.save();

            responseReturn(res, 200, {
                success: true,
                message: 'Order status updated successfully',
                order: order
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Upload delivery invoice
    upload_delivery_invoice = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { orderId } = req.params;
            const { invoiceUrl } = req.body;

            if (!invoiceUrl) {
                return responseReturn(res, 400, { message: 'Invoice URL is required' });
            }

            const order = await orderModel.findOne({
                _id: orderId,
                sellerId: sellerId
            });

            if (!order) {
                return responseReturn(res, 404, { message: 'Order not found' });
            }

            order.delivery_invoice = invoiceUrl;
            await order.save();

            responseReturn(res, 200, {
                success: true,
                message: 'Delivery invoice uploaded successfully',
                order: order
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    // Get seller orders
    get_seller_orders = async (req, res) => {
        try {
            const sellerId = req.seller.id;
            const { page = 1, limit = 10, status } = req.query;

            let query = { sellerId: sellerId };
            if (status) {
                query.delivery_status = status;
            }

            const orders = await orderModel.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const totalOrders = await orderModel.countDocuments(query);

            responseReturn(res, 200, {
                success: true,
                orders: orders,
                totalOrders: totalOrders,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalOrders / limit)
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }
}

module.exports = new sellerFeaturesController();
