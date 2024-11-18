const { formidable } = require('formidable');
const { responseReturn } = require('../../utils/response');
const cloudinary = require('cloudinary').v2;
const categoryModel = require('../../models/categoryModel');
class categoryController {
  add_category = async (req, res) => {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: 'Something went wrong 404.' });
      } else {
        let { name } = fields;
        let { image } = files;

        name = name.trim();
        const slug = name.split(' ').join('-');

        cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.CLOUD_API_KEY,
          api_secret: process.env.CLOUD_API_SECRET,
          secure: true,
        });
        try {
          const result = await cloudinary.uploader.upload(image.filepath, {
            folder: 'categories',
          });

          if (result) {
            const category = await categoryModel.create({
              name,
              slug,
              image: result.url,
            });
            responseReturn(res, 201, {
              category,
              message: 'Image successfully uploaded 201.',
            });
          } else {
            responseReturn(res, 404, {
              error: 'Image upload failed 404.',
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      }
    });
  }; // End of add category method

  getCategories = async (req, res) => {
    const { page, searchValue, perPage } = req.query;

    try {
      let skipPage = '';
      if (perPage && page) {
        skipPage = parseInt(perPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && perPage) {
        const categories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalCategories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        responseReturn(res, 201, {
          categories,
          totalCategories,
          message: 'Categories retrieved successfully.',
        });
      } else if (searchValue === '' && page && perPage) {
        const categories = await categoryModel
          .find({})
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalCategories = await categoryModel.find({}).countDocuments();
        responseReturn(res, 201, {
          categories,
          totalCategories,
          message: 'Categories retrieved successfully.',
        });
      } else {
        const categories = await categoryModel.find({}).sort({ createdAt: -1 });
        const totalCategories = await categoryModel.find({}).countDocuments();
        responseReturn(res, 201, {
          categories,
          totalCategories,
          message: 'Categories retrieved successfully.',
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get categories method

  editCategory = async (req, res) => {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: 'Something went wrong 404.' });
      } else {
        let { name } = fields;
        let { image } = files;
        const { id } = req.params;

        name = name.trim();
        const slug = name.split(' ').join('-');

        try {
          let result = null;
          if (image) {
            cloudinary.config({
              cloud_name: process.env.CLOUD_NAME,
              api_key: process.env.CLOUD_API_KEY,
              api_secret: process.env.CLOUD_API_SECRET,
              secure: true,
            });
            result = await cloudinary.uploader.upload(image.filepath, {
              folder: 'categories',
            });
          }
          const updateData = {
            name,
            slug,
          };
          if (result) {
            updateData.image = result.url;
          }

          const category = await categoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
          );

          responseReturn(res, 201, {
            category,
            message: 'Category edited successfully.',
          });
        } catch (error) {
          console.error('Error editing category:', error.message);
          responseReturn(res, 500, {
            message: 'Internal Server Error',
          });
        }
      }
    });
  }; // End of edit category method
}

module.exports = new categoryController();
