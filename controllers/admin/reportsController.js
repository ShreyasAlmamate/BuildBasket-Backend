const { responseReturn } = require('../../utiles/response');
const sellerModel = require('../../models/sellerModel');
const buyerModel = require('../../models/buyerModel');
const productModel = require('../../models/productModel');
const commodityModel = require('../../models/commodityModel');
const customerOrder = require('../../models/customerOrder');
const authOrder = require('../../models/authOrder');
const XLSX = require('xlsx');

class reportsController {
    
    // Get report statistics
    get_report_stats = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            // Seller stats
            const totalSellers = await sellerModel.countDocuments(dateFilter);
            const activeSellers = await sellerModel.countDocuments({ ...dateFilter, status: 'active' });

            // Buyer stats
            const totalBuyers = await buyerModel.countDocuments(dateFilter);
            const activeBuyers = await buyerModel.countDocuments({ ...dateFilter, status: 'active' });

            // Transaction stats
            const totalTransactions = await customerOrder.countDocuments(dateFilter);
            const transactionAmount = await customerOrder.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]);

            // Credit stats
            const creditApplications = await buyerModel.countDocuments({
                ...dateFilter,
                'creditInfo.hasApplied': true
            });
            const approvedCredit = await buyerModel.aggregate([
                { $match: { ...dateFilter, 'creditInfo.applicationStatus': 'approved' } },
                { $group: { _id: null, total: { $sum: '$creditInfo.approvedLimit' } } }
            ]);

            // Commodity stats
            const totalCommodities = await commodityModel.countDocuments(dateFilter);
            const activeCommodities = await commodityModel.countDocuments({ ...dateFilter, status: 'active' });

            responseReturn(res, 200, {
                success: true,
                stats: {
                    sellers: {
                        total: totalSellers,
                        active: activeSellers
                    },
                    buyers: {
                        total: totalBuyers,
                        active: activeBuyers
                    },
                    transactions: {
                        total: totalTransactions,
                        amount: transactionAmount[0]?.total || 0
                    },
                    credit: {
                        total: creditApplications,
                        amount: approvedCredit[0]?.total || 0
                    },
                    commodities: {
                        total: totalCommodities,
                        active: activeCommodities
                    },
                    analytics: {
                        total: totalSellers + totalBuyers + totalTransactions,
                        active: activeSellers + activeBuyers
                    }
                }
            });

        } catch (error) {
            console.error('Get report stats error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export sellers report
    export_sellers_report = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            const sellers = await sellerModel.find(dateFilter).select('-password').sort({ createdAt: -1 });

            // Prepare data for Excel export
            const exportData = sellers.map(seller => ({
                'Seller ID': seller._id,
                'Name': seller.name,
                'Email': seller.email,
                'Status': seller.status,
                'Payment Status': seller.payment,
                'Registration Method': seller.method,
                'Shop Name': seller.shopInfo?.shopName || 'N/A',
                'Shop Description': seller.shopInfo?.shopDescription || 'N/A',
                'Division': seller.shopInfo?.division || 'N/A',
                'District': seller.shopInfo?.district || 'N/A',
                'Sub District': seller.shopInfo?.sub_district || 'N/A',
                'Regions': seller.regions?.join(', ') || 'N/A',
                'GST Rate': seller.gstRate || 18,
                'Payment Method': seller.paymentMethod || 'direct',
                'Registration Date': seller.createdAt.toISOString().split('T')[0],
                'Last Updated': seller.updatedAt.toISOString().split('T')[0]
            }));

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sellers');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=sellers_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export sellers report error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export buyers report
    export_buyers_report = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            const buyers = await buyerModel.find(dateFilter).select('-password').sort({ createdAt: -1 });

            // Prepare data for Excel export
            const exportData = buyers.map(buyer => ({
                'Buyer ID': buyer._id,
                'Name': buyer.name,
                'Email': buyer.email,
                'Phone': buyer.phone,
                'Status': buyer.status,
                'Occupation': buyer.personalInfo?.occupation || 'N/A',
                'Company': buyer.personalInfo?.company || 'N/A',
                'Credit Applied': buyer.creditInfo?.hasApplied ? 'Yes' : 'No',
                'Credit Status': buyer.creditInfo?.applicationStatus || 'not_applied',
                'Requested Limit': buyer.creditInfo?.requestedLimit || 0,
                'Approved Limit': buyer.creditInfo?.approvedLimit || 0,
                'Current Utilization': buyer.creditInfo?.currentUtilization || 0,
                'Available Credit': buyer.creditInfo?.availableCredit || 0,
                'Total Orders': buyer.purchaseStats?.totalOrders || 0,
                'Total Spent': buyer.purchaseStats?.totalSpent || 0,
                'Average Order Value': buyer.purchaseStats?.averageOrderValue || 0,
                'Last Order Date': buyer.purchaseStats?.lastOrderDate ? buyer.purchaseStats.lastOrderDate.toISOString().split('T')[0] : 'N/A',
                'Registration Date': buyer.createdAt.toISOString().split('T')[0],
                'Last Login': buyer.lastLogin ? buyer.lastLogin.toISOString().split('T')[0] : 'Never',
                'Login Count': buyer.loginCount || 0,
                'Email Verified': buyer.verification?.email?.verified ? 'Yes' : 'No',
                'Phone Verified': buyer.verification?.phone?.verified ? 'Yes' : 'No'
            }));

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyers');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=buyers_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export buyers report error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export transactions report
    export_transactions_report = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            const orders = await customerOrder.find(dateFilter)
                .populate('customerId', 'name email')
                .sort({ createdAt: -1 });

            // Prepare data for Excel export
            const exportData = orders.map(order => ({
                'Order ID': order._id,
                'Customer Name': order.customerId?.name || 'N/A',
                'Customer Email': order.customerId?.email || 'N/A',
                'Total Price': order.price,
                'Payment Status': order.payment_status,
                'Delivery Status': order.delivery_status,
                'Shipping Info': order.shippingInfo || 'N/A',
                'Products Count': order.products?.length || 0,
                'Order Date': order.date || order.createdAt.toISOString().split('T')[0],
                'Created At': order.createdAt.toISOString(),
                'Updated At': order.updatedAt.toISOString()
            }));

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=transactions_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export transactions report error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export credit report
    export_credit_report = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    'creditInfo.applicationDate': {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            const creditApplications = await buyerModel.find({
                'creditInfo.hasApplied': true,
                ...dateFilter
            }).select('-password').sort({ 'creditInfo.applicationDate': -1 });

            // Prepare data for Excel export
            const exportData = creditApplications.map(buyer => ({
                'Buyer ID': buyer._id,
                'Name': buyer.name,
                'Email': buyer.email,
                'Phone': buyer.phone,
                'Application Status': buyer.creditInfo.applicationStatus,
                'Requested Limit': buyer.creditInfo.requestedLimit || 0,
                'Approved Limit': buyer.creditInfo.approvedLimit || 0,
                'Current Utilization': buyer.creditInfo.currentUtilization || 0,
                'Available Credit': buyer.creditInfo.availableCredit || 0,
                'Application Date': buyer.creditInfo.applicationDate ? buyer.creditInfo.applicationDate.toISOString().split('T')[0] : 'N/A',
                'Approval Date': buyer.creditInfo.approvalDate ? buyer.creditInfo.approvalDate.toISOString().split('T')[0] : 'N/A',
                'Admin Notes': buyer.creditInfo.adminNotes || 'N/A',
                'Documents Count': buyer.creditInfo.documents?.length || 0,
                'Credit History Count': buyer.creditInfo.creditHistory?.length || 0,
                'Registration Date': buyer.createdAt.toISOString().split('T')[0]
            }));

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Credit Applications');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=credit_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export credit report error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export commodities report
    export_commodities_report = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            const commodities = await commodityModel.find(dateFilter).sort({ createdAt: -1 });

            // Prepare data for Excel export
            const exportData = commodities.map(commodity => ({
                'Commodity ID': commodity._id,
                'Name': commodity.name,
                'Slug': commodity.slug,
                'Category': commodity.category,
                'Description': commodity.description,
                'Unit': commodity.unit,
                'Base Price': commodity.basePrice,
                'Status': commodity.status,
                'Current Price': commodity.marketData?.currentPrice || 0,
                'Volatility': commodity.marketData?.volatility || 0,
                'Trend': commodity.marketData?.trend || 'stable',
                'Regions': commodity.regions?.join(', ') || 'N/A',
                'Tags': commodity.tags?.join(', ') || 'N/A',
                'Created Date': commodity.createdAt.toISOString().split('T')[0],
                'Updated Date': commodity.updatedAt.toISOString().split('T')[0]
            }));

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Commodities');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=commodities_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export commodities report error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export analytics report
    export_analytics_report = async (req, res) => {
        const { startDate, endDate } = req.query;
        
        try {
            let dateFilter = {};
            if (startDate && endDate) {
                dateFilter = {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                };
            }

            // Gather analytics data
            const totalSellers = await sellerModel.countDocuments(dateFilter);
            const activeSellers = await sellerModel.countDocuments({ ...dateFilter, status: 'active' });
            const totalBuyers = await buyerModel.countDocuments(dateFilter);
            const totalOrders = await customerOrder.countDocuments(dateFilter);
            const totalRevenue = await customerOrder.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]);

            // Category distribution
            const categoryStats = await productModel.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            // Regional distribution
            const regionStats = await sellerModel.aggregate([
                { $match: dateFilter },
                { $unwind: '$regions' },
                { $group: { _id: '$regions', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            // Prepare analytics data
            const analyticsData = [
                {
                    'Metric': 'Total Sellers',
                    'Value': totalSellers,
                    'Period': `${startDate || 'All time'} to ${endDate || 'Present'}`
                },
                {
                    'Metric': 'Active Sellers',
                    'Value': activeSellers,
                    'Period': `${startDate || 'All time'} to ${endDate || 'Present'}`
                },
                {
                    'Metric': 'Total Buyers',
                    'Value': totalBuyers,
                    'Period': `${startDate || 'All time'} to ${endDate || 'Present'}`
                },
                {
                    'Metric': 'Total Orders',
                    'Value': totalOrders,
                    'Period': `${startDate || 'All time'} to ${endDate || 'Present'}`
                },
                {
                    'Metric': 'Total Revenue',
                    'Value': totalRevenue[0]?.total || 0,
                    'Period': `${startDate || 'All time'} to ${endDate || 'Present'}`
                }
            ];

            // Create workbook with multiple sheets
            const workbook = XLSX.utils.book_new();
            
            // Analytics overview sheet
            const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData);
            XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Analytics Overview');

            // Category stats sheet
            const categoryData = categoryStats.map(cat => ({
                'Category': cat._id,
                'Product Count': cat.count
            }));
            const categorySheet = XLSX.utils.json_to_sheet(categoryData);
            XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Distribution');

            // Region stats sheet
            const regionData = regionStats.map(region => ({
                'Region': region._id,
                'Seller Count': region.count
            }));
            const regionSheet = XLSX.utils.json_to_sheet(regionData);
            XLSX.utils.book_append_sheet(workbook, regionSheet, 'Regional Distribution');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers for file download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=analytics_report_${startDate || 'all'}_to_${endDate || 'all'}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export analytics report error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };
}

module.exports = new reportsController();
