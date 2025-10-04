const { responseReturn } = require('../../utiles/response');
const buyerModel = require('../../models/buyerModel');
const bcrypt = require('bcrypt');
const { createToken } = require('../../utiles/tokenCreate');
const XLSX = require('xlsx');

class buyerController {
    
    // Get all buyers with pagination and search
    get_buyers = async (req, res) => {
        const { page = 1, parPage = 10, searchValue = '', status = 'all' } = req.query;
        const skipPage = parseInt(parPage) * (parseInt(page) - 1);

        try {
            let query = {};
            
            if (searchValue) {
                query = {
                    $or: [
                        { name: { $regex: searchValue, $options: 'i' } },
                        { email: { $regex: searchValue, $options: 'i' } },
                        { phone: { $regex: searchValue, $options: 'i' } }
                    ]
                };
            }

            if (status !== 'all') {
                query.status = status;
            }

            const buyers = await buyerModel
                .find(query)
                .select('-password')
                .skip(skipPage)
                .limit(parseInt(parPage))
                .sort({ createdAt: -1 });

            const totalBuyers = await buyerModel.countDocuments(query);

            responseReturn(res, 200, {
                success: true,
                buyers,
                totalBuyers,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalBuyers / parseInt(parPage))
            });

        } catch (error) {
            console.error('Get buyers error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Get single buyer
    get_buyer = async (req, res) => {
        const { buyerId } = req.params;

        try {
            const buyer = await buyerModel.findById(buyerId).select('-password');
            
            if (!buyer) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Buyer not found' 
                });
            }

            responseReturn(res, 200, {
                success: true,
                buyer
            });

        } catch (error) {
            console.error('Get buyer error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Create new buyer (Admin registration)
    create_buyer = async (req, res) => {
        const { 
            name, 
            email, 
            phone, 
            password,
            personalInfo,
            addresses,
            creditLimit 
        } = req.body;

        try {
            // Check if buyer already exists
            const existingBuyer = await buyerModel.findOne({ 
                $or: [{ email }, { phone }] 
            });

            if (existingBuyer) {
                return responseReturn(res, 400, { 
                    success: false, 
                    error: 'Buyer with this email or phone already exists' 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const buyer = await buyerModel.create({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                password: hashedPassword,
                personalInfo: personalInfo || {},
                addresses: addresses || [],
                creditInfo: {
                    approvedLimit: creditLimit || 0,
                    applicationStatus: creditLimit > 0 ? 'approved' : 'not_applied'
                }
            });

            // Remove password from response
            const buyerResponse = buyer.toObject();
            delete buyerResponse.password;

            responseReturn(res, 201, {
                success: true,
                message: 'Buyer created successfully',
                buyer: buyerResponse
            });

        } catch (error) {
            console.error('Create buyer error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Update buyer
    update_buyer = async (req, res) => {
        const { buyerId } = req.params;
        const updateData = req.body;

        try {
            // Remove sensitive fields from update
            delete updateData.password;
            delete updateData.role;

            const buyer = await buyerModel.findByIdAndUpdate(
                buyerId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!buyer) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Buyer not found' 
                });
            }

            responseReturn(res, 200, {
                success: true,
                message: 'Buyer updated successfully',
                buyer
            });

        } catch (error) {
            console.error('Update buyer error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Delete buyer
    delete_buyer = async (req, res) => {
        const { buyerId } = req.params;

        try {
            const buyer = await buyerModel.findByIdAndDelete(buyerId);
            
            if (!buyer) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Buyer not found' 
                });
            }

            responseReturn(res, 200, {
                success: true,
                message: 'Buyer deleted successfully'
            });

        } catch (error) {
            console.error('Delete buyer error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Get credit limit applications
    get_credit_applications = async (req, res) => {
        const { page = 1, parPage = 10, status = 'pending' } = req.query;
        const skipPage = parseInt(parPage) * (parseInt(page) - 1);

        try {
            let query = { 'creditInfo.hasApplied': true };
            
            if (status !== 'all') {
                query['creditInfo.applicationStatus'] = status;
            }

            const applications = await buyerModel
                .find(query)
                .select('name email phone creditInfo createdAt')
                .skip(skipPage)
                .limit(parseInt(parPage))
                .sort({ 'creditInfo.applicationDate': -1 });

            const totalApplications = await buyerModel.countDocuments(query);

            responseReturn(res, 200, {
                success: true,
                applications,
                totalApplications,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalApplications / parseInt(parPage))
            });

        } catch (error) {
            console.error('Get credit applications error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Review credit limit application
    review_credit_application = async (req, res) => {
        const { buyerId } = req.params;
        const { status, approvedLimit, adminNotes } = req.body;
        const { id: adminId } = req;

        try {
            const buyer = await buyerModel.findById(buyerId);
            
            if (!buyer) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Buyer not found' 
                });
            }

            if (!buyer.creditInfo.hasApplied) {
                return responseReturn(res, 400, { 
                    success: false, 
                    error: 'No credit application found for this buyer' 
                });
            }

            // Update credit application
            buyer.creditInfo.applicationStatus = status;
            buyer.creditInfo.adminNotes = adminNotes || '';
            buyer.creditInfo.reviewedBy = adminId;

            if (status === 'approved') {
                buyer.creditInfo.approvedLimit = approvedLimit || buyer.creditInfo.requestedLimit;
                buyer.creditInfo.availableCredit = buyer.creditInfo.approvedLimit;
                buyer.creditInfo.approvalDate = new Date();
            } else if (status === 'rejected') {
                buyer.creditInfo.approvedLimit = 0;
                buyer.creditInfo.availableCredit = 0;
            }

            await buyer.save();

            responseReturn(res, 200, {
                success: true,
                message: `Credit application ${status} successfully`,
                buyer: {
                    id: buyer._id,
                    name: buyer.name,
                    email: buyer.email,
                    creditInfo: buyer.creditInfo
                }
            });

        } catch (error) {
            console.error('Review credit application error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Get buyer statistics
    get_buyer_stats = async (req, res) => {
        try {
            const totalBuyers = await buyerModel.countDocuments();
            const activeBuyers = await buyerModel.countDocuments({ status: 'active' });
            const inactiveBuyers = await buyerModel.countDocuments({ status: 'inactive' });
            const pendingBuyers = await buyerModel.countDocuments({ status: 'pending' });

            // Credit statistics
            const creditStats = await buyerModel.aggregate([
                {
                    $group: {
                        _id: '$creditInfo.applicationStatus',
                        count: { $sum: 1 },
                        totalRequested: { $sum: '$creditInfo.requestedLimit' },
                        totalApproved: { $sum: '$creditInfo.approvedLimit' }
                    }
                }
            ]);

            // Recent registrations
            const recentBuyers = await buyerModel
                .find({})
                .select('name email phone createdAt status')
                .sort({ createdAt: -1 })
                .limit(5);

            responseReturn(res, 200, {
                success: true,
                stats: {
                    totalBuyers,
                    activeBuyers,
                    inactiveBuyers,
                    pendingBuyers,
                    creditStats,
                    recentBuyers
                }
            });

        } catch (error) {
            console.error('Get buyer stats error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export buyers to Excel
    export_buyers = async (req, res) => {
        try {
            const buyers = await buyerModel
                .find({})
                .select('-password')
                .sort({ createdAt: -1 });

            // Prepare data for Excel export
            const exportData = buyers.map(buyer => ({
                Name: buyer.name,
                Email: buyer.email,
                Phone: buyer.phone,
                Status: buyer.status,
                'Registration Date': buyer.createdAt.toISOString().split('T')[0],
                'Credit Applied': buyer.creditInfo.hasApplied ? 'Yes' : 'No',
                'Credit Status': buyer.creditInfo.applicationStatus,
                'Requested Limit': buyer.creditInfo.requestedLimit,
                'Approved Limit': buyer.creditInfo.approvedLimit,
                'Current Utilization': buyer.creditInfo.currentUtilization,
                'Available Credit': buyer.creditInfo.availableCredit,
                'Total Orders': buyer.purchaseStats.totalOrders,
                'Total Spent': buyer.purchaseStats.totalSpent,
                'Last Login': buyer.lastLogin ? buyer.lastLogin.toISOString().split('T')[0] : 'Never'
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
            res.setHeader('Content-Disposition', `attachment; filename=buyers_export_${new Date().toISOString().split('T')[0]}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export buyers error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Import buyers from Excel
    import_buyers = async (req, res) => {
        try {
            if (!req.file) {
                return responseReturn(res, 400, { 
                    success: false, 
                    message: 'No Excel file uploaded' 
                });
            }

            // Read Excel file from memory buffer
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                return responseReturn(res, 400, { 
                    success: false, 
                    message: 'Excel file is empty' 
                });
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

                    // Check if buyer already exists
                    const existingBuyer = await buyerModel.findOne({ 
                        $or: [{ email: row.email }, { phone: row.phone }] 
                    });

                    if (existingBuyer) {
                        results.errors++;
                        results.details.push(`Row ${i + 2}: Buyer with email ${row.email} or phone ${row.phone} already exists`);
                        continue;
                    }

                    const buyerData = {
                        name: row.name.trim(),
                        email: row.email.trim().toLowerCase(),
                        phone: row.phone.trim(),
                        password: await bcrypt.hash(row.password || 'defaultPassword123', 10),
                        status: row.status || 'active',
                        personalInfo: {
                            occupation: row.occupation || '',
                            company: row.company || ''
                        },
                        creditInfo: {
                            approvedLimit: parseFloat(row.creditLimit) || 0,
                            applicationStatus: parseFloat(row.creditLimit) > 0 ? 'approved' : 'not_applied'
                        }
                    };

                    await buyerModel.create(buyerData);
                    results.success++;
                    results.details.push(`Row ${i + 2}: Created buyer "${row.name}"`);

                } catch (error) {
                    results.errors++;
                    results.details.push(`Row ${i + 2}: Error - ${error.message}`);
                }
            }

            responseReturn(res, 200, {
                success: true,
                message: 'Buyers import completed',
                results: {
                    success: results.success,
                    errors: results.errors,
                    details: results.details,
                    total: results.success + results.errors
                }
            });

        } catch (error) {
            console.error('Import buyers error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };
}

module.exports = new buyerController();
