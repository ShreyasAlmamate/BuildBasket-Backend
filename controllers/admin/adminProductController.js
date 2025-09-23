const formidable = require("formidable")
const { responseReturn } = require("../../utiles/response")
const cloudinary = require('cloudinary').v2
const productModel = require('../../models/productModel')
const sellerModel = require('../../models/sellerModel')
const { updateSingleProductCommission } = require('../../utiles/updateAllProductsCommission')
 
class adminProductController {

    // Admin can add products for any seller
    add_product = async(req, res) => {
        const {id} = req; // Admin ID
        console.log('Admin product creation request from admin ID:', id);
        
        const form = formidable({ multiples: true })

        form.parse(req, async(err, field, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                return responseReturn(res, 400, { error: 'Failed to parse form data' })
            }

            let {name, category, description, stock, price, discount, shopName, brand, sellerId} = field;
            let {images} = files;
            
            console.log('Received product data:', {
                name, category, description, stock, price, discount, shopName, brand, sellerId,
                imagesCount: images ? (Array.isArray(images) ? images.length : 1) : 0
            });

            name = name.trim()
            const slug = name.split(' ').join('-')

            // Check if required fields are present
            if (!name || !category || !description || !stock || !price || !brand || !sellerId) {
                console.log('Missing required fields:', { name: !!name, category: !!category, description: !!description, stock: !!stock, price: !!price, brand: !!brand, sellerId: !!sellerId });
                return responseReturn(res, 400, { error: 'All required fields must be filled including sellerId' })
            }

            // Verify seller exists
            try {
                const seller = await sellerModel.findById(sellerId);
                if (!seller) {
                    return responseReturn(res, 400, { error: 'Invalid seller ID' })
                }
            } catch (error) {
                return responseReturn(res, 400, { error: 'Invalid seller ID' })
            }

            try {
                let allImageUrl = [];

                // Handle image uploads
                if (images) {
                    // Check if Cloudinary is configured
                    if (process.env.cloud_name && process.env.api_key && process.env.api_secret) {
                        console.log('Using Cloudinary for image upload');
                        cloudinary.config({
                            cloud_name: process.env.cloud_name,
                            api_key: process.env.api_key,
                            api_secret: process.env.api_secret,
                            secure: true
                        })

                        if (!Array.isArray(images)) {
                            images = [images]; 
                        } 

                        for (let i = 0; i < images.length; i++) {
                            try {
                                const result = await cloudinary.uploader.upload(images[i].filepath, {folder: 'products'});
                                allImageUrl.push(result.url);
                                console.log('Image uploaded to Cloudinary:', result.url);
                            } catch (uploadError) {
                                console.error('Cloudinary upload error:', uploadError);
                                // Use a placeholder image if upload fails
                                allImageUrl.push('https://via.placeholder.com/400x400?text=Product+Image');
                            }
                        }
                    } else {
                        console.log('Cloudinary not configured, using placeholder images');
                        // If Cloudinary is not configured, use placeholder images
                        if (!Array.isArray(images)) {
                            images = [images]; 
                        } 
                        for (let i = 0; i < images.length; i++) {
                            allImageUrl.push('https://via.placeholder.com/400x400?text=Product+Image');
                        }
                    }
                } else {
                    console.log('No images provided, using default placeholder');
                    // No images provided, use default placeholder
                    allImageUrl.push('https://via.placeholder.com/400x400?text=Product+Image');
                }

                console.log('Creating product with data:', {
                    sellerId: sellerId,
                    name,
                    slug,
                    shopName: shopName || 'Admin Store',
                    category: category.trim(),
                    description: description.trim(),
                    stock: parseInt(stock) || 0,
                    price: parseInt(price) || 0,
                    discount: parseInt(discount) || 0,
                    images: allImageUrl,
                    brand: brand.trim(),
                    status: 'active'
                });

                // Create the product
                const product = await productModel.create({
                    sellerId: sellerId,
                    name,
                    slug,
                    shopName: shopName || 'Admin Store',
                    category: category.trim(),
                    description: description.trim(),
                    stock: parseInt(stock) || 0,
                    price: parseInt(price) || 0,
                    discount: parseInt(discount) || 0,
                    images: allImageUrl,
                    brand: brand.trim(),
                    status: 'active'
                })

                console.log('Product created successfully:', product._id);

                // Update commission for the new product
                try {
                    const commissionResult = await updateSingleProductCommission(product._id, product.price);
                    if (commissionResult.success) {
                        console.log('Commission updated for new product:', product._id);
                    } else {
                        console.warn('Failed to update commission for new product:', commissionResult.message);
                    }
                } catch (error) {
                    console.error('Error updating commission for new product:', error);
                }

                responseReturn(res, 201, { 
                    message: 'Product Added Successfully by Admin',
                    product: {
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        sellerId: product.sellerId
                    }
                })
                
            } catch (error) {
                console.error('Product creation error:', error);
                responseReturn(res, 500, { error: 'Failed to create product. Please try again.' })
            }

        })
    }

    // Admin can get all products from all sellers
    products_get = async (req, res) => {
        const {page, searchValue, parPage} = req.query 

        const skipPage = parseInt(parPage) * (parseInt(page) - 1)

        try {
            if (searchValue) {
                const products = await productModel.find({
                    $text: { $search: searchValue }
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1}).populate('sellerId', 'name shopName')
                const totalProduct = await productModel.find({
                    $text: { $search: searchValue }
                }).countDocuments()
                responseReturn(res, 200, {products, totalProduct})
            } else {
                const products = await productModel.find({}).skip(skipPage).limit(parPage).sort({ createdAt: -1}).populate('sellerId', 'name shopName')
                const totalProduct = await productModel.find({}).countDocuments()
                responseReturn(res, 200, {products, totalProduct}) 
            }
            
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: 'Failed to fetch products' })
        }
    }

    // Admin can get any product
    product_get = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId).populate('sellerId', 'name shopName email')
            responseReturn(res, 200, {product})
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: 'Failed to fetch product' })
        }
    }

    // Admin can update any product
    product_update = async (req, res) => {
        let {name, description, stock, price, category, discount, brand, productId, sellerId} = req.body;
        name = name.trim()
        const slug = name.split(' ').join('-')

        try {
            // If sellerId is provided, verify it exists
            if (sellerId) {
                const seller = await sellerModel.findById(sellerId);
                if (!seller) {
                    return responseReturn(res, 400, { error: 'Invalid seller ID' })
                }
            }

            const updateData = {
                name, description, stock, price, category, discount, brand, slug
            }

            if (sellerId) {
                updateData.sellerId = sellerId;
            }

            await productModel.findByIdAndUpdate(productId, updateData)
            const product = await productModel.findById(productId).populate('sellerId', 'name shopName')
            responseReturn(res, 200, {product, message: 'Product Updated Successfully by Admin'})
        } catch (error) {
            responseReturn(res, 500, { error: error.message })
        }
    } 

    // Admin can update product images
    product_image_update = async(req, res) => {
        const form = formidable({ multiples: true })

        form.parse(req, async (err, field, files) => {
            const {oldImage, productId} = field;
            const { newImage } = files

            if (err) {
                responseReturn(res, 400, { error: err.message })
            } else {
                try {
                    cloudinary.config({
                        cloud_name: process.env.cloud_name,
                        api_key: process.env.api_key,
                        api_secret: process.env.api_secret,
                        secure: true
                    })

                    const result = await cloudinary.uploader.upload(newImage.filepath, { folder: 'products'})

                    if (result) {
                        let {images} = await productModel.findById(productId)
                        const index = images.findIndex(img => img === oldImage) 
                        images[index] = result.url;
                        await productModel.findByIdAndUpdate(productId, {images}) 

                        const product = await productModel.findById(productId).populate('sellerId', 'name shopName')
                        responseReturn(res, 200, {product, message: 'Product Image Updated Successfully by Admin'})

                    } else {
                        responseReturn(res, 404, { error: 'Image Upload Failed'})
                    }

                } catch (error) {
                    responseReturn(res, 404, { error: error.message })
                }
            }
        })
    }

    // Admin can delete any product
    product_delete = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findByIdAndDelete(productId);
            if (!product) {
                return responseReturn(res, 404, { error: 'Product not found' })
            }
            responseReturn(res, 200, { message: 'Product deleted successfully by Admin' })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: 'Failed to delete product' })
        }
    }

    // Admin can get all sellers for product assignment
    get_sellers = async (req, res) => {
        try {
            const sellers = await sellerModel.find({ status: 'active' }).select('_id name shopName email')
            responseReturn(res, 200, { sellers })
        } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: 'Failed to fetch sellers' })
        }
    }
}

module.exports = new adminProductController()
