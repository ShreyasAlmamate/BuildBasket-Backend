const formidable = require("formidable")
const { responseReturn } = require("../../utiles/response")
const cloudinary = require('cloudinary').v2
const categoryModel = require('../../models/categoryModel')
 
class adminCategoryController {

    // Admin can add categories
    add_category = async (req, res) => {
        const form = formidable()
        form.parse(req, async(err, fields, files) => {
            if (err) {
                responseReturn(res, 404, { error: 'something went wrong' })
            } else {
                let {name, description} = fields
                let {image} = files
                name = name.trim()
                const slug = name.split(' ').join('-')

                cloudinary.config({
                    cloud_name: process.env.cloud_name,
                    api_key: process.env.api_key,
                    api_secret: process.env.api_secret,
                    secure: true
                })

               try {
                const result = await cloudinary.uploader.upload(image.filepath, { folder: 'categorys'})

                if (result) {
                    const category = await categoryModel.create({
                        name,
                        slug,
                        image: result.url,
                        description: description ? description.trim() : ''
                    })
                    responseReturn(res, 201, { category, message: 'Category Added Successfully by Admin' })
                    
                } else {
                    responseReturn(res, 404, { error: 'Image Upload Failed' })
                }
                
               } catch (error) {
                responseReturn(res, 500, { error: 'Internal Server Error' })
               }
            }
        })
    }

    // Admin can get all categories
    get_category = async (req, res) => {
       const {page, searchValue, parPage} = req.query 

       try {
            let skipPage = ''
            if (parPage && page) {
                skipPage = parseInt(parPage) * (parseInt(page) - 1)
            }

        if (searchValue && page && parPage) {
            const categorys = await categoryModel.find({
                $text: { $search: searchValue }
            }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalCategory = await categoryModel.find({
                $text: { $search: searchValue }
            }).countDocuments()
            responseReturn(res, 200, {categorys, totalCategory})
        } 
        else if(searchValue === '' && page && parPage) {
            const categorys = await categoryModel.find({ }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
            const totalCategory = await categoryModel.find({ }).countDocuments()
            responseReturn(res, 200, {categorys, totalCategory}) 
        } 
        else {
            const categorys = await categoryModel.find({ }).sort({ createdAt: -1})
            const totalCategory = await categoryModel.find({ }).countDocuments()
            responseReturn(res, 200, {categorys, totalCategory})
        }
        
       } catch (error) {
            console.log(error.message)
            responseReturn(res, 500, { error: 'Failed to fetch categories' })
       }
    }

    // Admin can update any category
    update_category = async (req, res) => {
        const form = formidable()
        form.parse(req, async(err, fields, files) => {
            if (err) {
                responseReturn(res, 404, { error: 'something went wrong' })
            } else {
                let {name, description} = fields
                let {image} = files
                const {id} = req.params;

                name = name.trim()
                const slug = name.split(' ').join('-')

            try {
                let result = null;
                if (image) {
                    cloudinary.config({
                        cloud_name: process.env.cloud_name,
                        api_key: process.env.api_key,
                        api_secret: process.env.api_secret,
                        secure: true
                    });

                    result = await cloudinary.uploader.upload(image.filepath, { folder: 'categorys'})
                }

                const updateData = {
                    name,
                    slug,
                    description: description ? description.trim() : ''
                }

                if (result) {
                    updateData.image = result.url;
                }
                
                const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true});
                responseReturn(res, 200, {category, message: 'Category Updated successfully by Admin'})
                        
            } catch (error) {
                responseReturn(res, 500, { error: 'Internal Server Error' })
            } 
            }
        })
    }

    // Admin can delete any category
    deleteCategory = async (req, res) => {
        try {
            const categoryId = req.params.id;
            const deleteCategory = await categoryModel.findByIdAndDelete(categoryId);

            if (!deleteCategory) {
                console.log(`Category with id ${categoryId} not found`);
                return responseReturn(res, 404, { error: 'Category not found' });
            }
            responseReturn(res, 200, { message: 'Category deleted successfully by Admin' });
            
        } catch (error) {
            console.log(`Error delete category with id ${categoryId}:`, error);
            responseReturn(res, 500, { error: 'Internal Server Error' });
        }
    }

    // Admin can get category by ID
    get_category_by_id = async (req, res) => {
        try {
            const { id } = req.params;
            const category = await categoryModel.findById(id);
            
            if (!category) {
                return responseReturn(res, 404, { error: 'Category not found' });
            }
            
            responseReturn(res, 200, { category });
        } catch (error) {
            console.log(error.message);
            responseReturn(res, 500, { error: 'Failed to fetch category' });
        }
    }
}

module.exports = new adminCategoryController()
