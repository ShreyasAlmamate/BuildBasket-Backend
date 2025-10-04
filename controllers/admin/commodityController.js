const { responseReturn } = require('../../utiles/response');
const commodityModel = require('../../models/commodityModel');
const XLSX = require('xlsx');

class commodityController {
    
    // Get all commodities with pagination and search
    get_commodities = async (req, res) => {
        const { page = 1, parPage = 10, searchValue = '' } = req.query;
        const skipPage = parseInt(parPage) * (parseInt(page) - 1);

        try {
            let query = {};
            
            if (searchValue) {
                query = {
                    $or: [
                        { name: { $regex: searchValue, $options: 'i' } },
                        { category: { $regex: searchValue, $options: 'i' } },
                        { tags: { $in: [new RegExp(searchValue, 'i')] } }
                    ]
                };
            }

            const commodities = await commodityModel
                .find(query)
                .skip(skipPage)
                .limit(parseInt(parPage))
                .sort({ createdAt: -1 });

            const totalCommodities = await commodityModel.countDocuments(query);

            responseReturn(res, 200, {
                success: true,
                commodities,
                totalCommodities,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCommodities / parseInt(parPage))
            });

        } catch (error) {
            console.error('Get commodities error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Get single commodity
    get_commodity = async (req, res) => {
        const { commodityId } = req.params;

        try {
            const commodity = await commodityModel.findById(commodityId);
            
            if (!commodity) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Commodity not found' 
                });
            }

            responseReturn(res, 200, {
                success: true,
                commodity
            });

        } catch (error) {
            console.error('Get commodity error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Create new commodity
    create_commodity = async (req, res) => {
        const { 
            name, 
            category, 
            description, 
            unit, 
            basePrice, 
            image, 
            regions, 
            grades, 
            specifications, 
            tags 
        } = req.body;

        try {
            // Check if commodity with same name already exists
            const existingCommodity = await commodityModel.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') } 
            });

            if (existingCommodity) {
                return responseReturn(res, 400, { 
                    success: false, 
                    error: 'Commodity with this name already exists' 
                });
            }

            const commodity = await commodityModel.create({
                name: name.trim(),
                category: category.trim(),
                description: description?.trim() || '',
                unit: unit?.trim() || 'Unit',
                basePrice: parseFloat(basePrice) || 0,
                image: image || '',
                regions: regions || [],
                grades: grades || [],
                specifications: specifications || {},
                tags: tags || []
            });

            responseReturn(res, 201, {
                success: true,
                message: 'Commodity created successfully',
                commodity
            });

        } catch (error) {
            console.error('Create commodity error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Update commodity
    update_commodity = async (req, res) => {
        const { commodityId } = req.params;
        const updateData = req.body;

        try {
            // Check if commodity exists
            const existingCommodity = await commodityModel.findById(commodityId);
            if (!existingCommodity) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Commodity not found' 
                });
            }

            // If name is being updated, check for duplicates
            if (updateData.name && updateData.name !== existingCommodity.name) {
                const duplicateName = await commodityModel.findOne({ 
                    name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                    _id: { $ne: commodityId }
                });

                if (duplicateName) {
                    return responseReturn(res, 400, { 
                        success: false, 
                        error: 'Commodity with this name already exists' 
                    });
                }
            }

            // Clean and validate data
            if (updateData.name) updateData.name = updateData.name.trim();
            if (updateData.category) updateData.category = updateData.category.trim();
            if (updateData.description) updateData.description = updateData.description.trim();
            if (updateData.unit) updateData.unit = updateData.unit.trim();
            if (updateData.basePrice) updateData.basePrice = parseFloat(updateData.basePrice);

            const commodity = await commodityModel.findByIdAndUpdate(
                commodityId,
                updateData,
                { new: true, runValidators: true }
            );

            responseReturn(res, 200, {
                success: true,
                message: 'Commodity updated successfully',
                commodity
            });

        } catch (error) {
            console.error('Update commodity error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Delete commodity
    delete_commodity = async (req, res) => {
        const { commodityId } = req.params;

        try {
            const commodity = await commodityModel.findByIdAndDelete(commodityId);
            
            if (!commodity) {
                return responseReturn(res, 404, { 
                    success: false, 
                    error: 'Commodity not found' 
                });
            }

            responseReturn(res, 200, {
                success: true,
                message: 'Commodity deleted successfully'
            });

        } catch (error) {
            console.error('Delete commodity error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Import commodities from Excel
    import_commodities = async (req, res) => {
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
                success: true,
                message: 'Commodities import completed',
                results: {
                    success: results.success,
                    errors: results.errors,
                    details: results.details,
                    total: results.success + results.errors
                }
            });

        } catch (error) {
            console.error('Import commodities error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Export commodities to Excel
    export_commodities = async (req, res) => {
        try {
            const commodities = await commodityModel.find({}).sort({ createdAt: -1 });

            // Prepare data for Excel export
            const exportData = commodities.map(commodity => ({
                Name: commodity.name,
                Category: commodity.category,
                Description: commodity.description,
                Unit: commodity.unit,
                'Base Price': commodity.basePrice,
                Status: commodity.status,
                'Created Date': commodity.createdAt.toISOString().split('T')[0],
                Tags: commodity.tags.join(', '),
                Regions: commodity.regions.join(', ')
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
            res.setHeader('Content-Disposition', `attachment; filename=commodities_export_${new Date().toISOString().split('T')[0]}.xlsx`);

            res.send(excelBuffer);

        } catch (error) {
            console.error('Export commodities error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };

    // Get commodity statistics
    get_commodity_stats = async (req, res) => {
        try {
            const totalCommodities = await commodityModel.countDocuments();
            const activeCommodities = await commodityModel.countDocuments({ status: 'active' });
            const inactiveCommodities = await commodityModel.countDocuments({ status: 'inactive' });

            // Get category distribution
            const categoryStats = await commodityModel.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            // Get recent commodities
            const recentCommodities = await commodityModel
                .find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name category createdAt');

            responseReturn(res, 200, {
                success: true,
                stats: {
                    totalCommodities,
                    activeCommodities,
                    inactiveCommodities,
                    categoryStats,
                    recentCommodities
                }
            });

        } catch (error) {
            console.error('Get commodity stats error:', error);
            responseReturn(res, 500, { 
                success: false, 
                error: error.message 
            });
        }
    };
}

module.exports = new commodityController();
