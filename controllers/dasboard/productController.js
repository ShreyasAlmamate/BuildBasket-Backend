const formidable = require("formidable")
const { responseReturn } = require("../../utiles/response")
const cloudinary = require('cloudinary').v2
const productModel = require('../../models/productModel')
 
class productController{

    add_product = async(req,res) => {
        const {id} = req;
        console.log('Product creation request from seller ID:', id);
        
        const form = formidable({ multiples: true })

        form.parse(req, async(err, field, files) => {
            if (err) {
                console.error('Form parsing error:', err);
                return responseReturn(res, 400, { error: 'Failed to parse form data' })
            }

            let {name, category,description, stock,price, discount,shopName,brand} = field;
            let {images} = files;
            
            console.log('Received product data:', {
                name, category, description, stock, price, discount, shopName, brand,
                imagesCount: images ? (Array.isArray(images) ? images.length : 1) : 0
            });

            name = name.trim()
            const slug = name.split(' ').join('-')

            // Check if required fields are present
            if (!name || !category || !description || !stock || !price || !brand) {
                console.log('Missing required fields:', { name: !!name, category: !!category, description: !!description, stock: !!stock, price: !!price, brand: !!brand });
                return responseReturn(res, 400, { error: 'All required fields must be filled' })
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
                    sellerId: id,
                    name,
                    slug,
                    shopName: shopName || 'BuildBasket',
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
                    sellerId: id,
                    name,
                    slug,
                    shopName: shopName || 'BuildBasket',
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

                responseReturn(res, 201, { 
                    message: 'Product Added Successfully',
                    product: {
                        _id: product._id,
                        name: product.name,
                        slug: product.slug
                    }
                })
                
            } catch (error) {
                console.error('Product creation error:', error);
                responseReturn(res, 500, { error: 'Failed to create product. Please try again.' })
            }
 
        })
         
    }

    /// end method 

    products_get = async (req, res) => {
        const {page,searchValue, parPage} = req.query 
        const {id} = req;

       const skipPage = parseInt(parPage) * (parseInt(page) - 1)

        try {

            if (searchValue) {
                const products = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
                const totalProduct = await productModel.find({
                    $text: { $search: searchValue },
                    sellerId: id
                }).countDocuments()
                responseReturn(res, 200,{products,totalProduct})
            } else {
                const products = await productModel.find({ sellerId:id }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalProduct = await productModel.find({ sellerId:id }).countDocuments()
            responseReturn(res, 200,{products,totalProduct}) 
            }
            
        } catch (error) {
            console.log(error.message)
        } 

    }

    // End Method 

    product_get = async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await productModel.findById(productId)
            responseReturn(res, 200,{product})
        } catch (error) {
            console.log(error.message)
        }
    }
    // End Method 

    product_update = async (req, res) => {
        let {name, description, stock,price,category, discount,brand,productId} = req.body;
        name = name.trim()
        const slug = name.split(' ').join('-')

        try {
            await productModel.findByIdAndUpdate(productId, {
                name, description, stock,price,category, discount,brand,productId, slug
            })
            const product = await productModel.findById(productId)
            responseReturn(res, 200,{product, message : 'Product Updated Successfully'})
        } catch (error) {
            responseReturn(res, 500,{ error : error.message })
        }


    } 

  // End Method 

  product_image_update = async(req,res) => {
    const form = formidable({ multiples: true })

    form.parse(req, async (err, field, files) => {
        const {oldImage,productId} = field;
        const { newImage } = files

        if (err) {
            responseReturn(res, 400,{ error : err.message })
        }else{
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
                    await productModel.findByIdAndUpdate(productId,{images}) 

                    const product = await productModel.findById(productId)
                    responseReturn(res, 200,{product, message : 'Product Image Updated Successfully'})

                } else {
                    responseReturn(res, 404,{ error : 'Image Upload Failed'})
                }

                
            } catch (error) {
                responseReturn(res, 404,{ error : error.message })
            }
        }

 

    })
  }
  // End Method 



}

module.exports = new productController()