const { formidable } = require('formidable');
const { responseReturn } = require('../../utils/response');
const cloudinary = require('cloudinary').v2;
const categoryModel = require('../../models/categoryModel');
class categoryController {
  add_category = async (req, res) => {
    const form = formidable();
    // const form = new formidable.IncomingForm();

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
          responseReturn(res, 500, {
            error: 'Internal server error during image upload 500.',
          });
        }
      }
    });
  };

  getCategory = async (req, res) => {
    console.log('Working');
  };
}

module.exports = new categoryController();
