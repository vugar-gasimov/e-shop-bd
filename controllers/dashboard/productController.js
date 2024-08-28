const { formidable } = require('formidable');
const { responseReturn } = require('../../utils/response');
const cloudinary = require('cloudinary').v2;
const productModel = require('../../models/productModel');
class productController {
  add_product = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      if (err) {
        responseReturn(res, 400, { error: 'Form parsing error' });
      }
      let {
        name,
        category,
        description,
        stock,
        price,
        discount,
        shopName,
        brand,
      } = field;
      let { images } = files;
      name = name?.toString().trim();
      category = category?.toString().trim();
      description = description?.toString().trim();
      brand = brand?.toString().trim();
      stock = parseInt(stock);
      price = parseInt(price);
      discount = parseInt(discount);
      const slug = name.split(' ').join('-');
      if (isNaN(discount)) {
        discount = 0;
      }
      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true,
      });

      try {
        let allImageUrls = [];

        if (images) {
          if (!Array.isArray(images)) {
            images = [images];
          }

          const uploadPromises = images.map((image) =>
            cloudinary.uploader.upload(image.filepath, {
              folder: 'products',
            })
          );

          const uploadResults = await Promise.all(uploadPromises);
          allImageUrls = uploadResults.map((result) => result.url);
        }

        await productModel.create({
          vendorId: id,
          name,
          slug,
          shopName,
          category,
          description,
          brand,
          stock,
          price,
          discount,
          images: allImageUrls,
        });
        responseReturn(res, 201, {
          message: "Product successfully added '201'.",
        });
      } catch (error) {
        console.error(error);
        responseReturn(res, 500, {
          error: "Internal server error during 'Product adding 500'.",
        });
      }
    });
  }; // End of add product method

  get_products = async (req, res) => {
    const { page, searchValue, perPage } = req.query;

    const { id } = req;
    let skipPage = '';
    skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      let products, totalProducts;
      if (searchValue) {
        const products = await productModel
          .find({
            $text: { $search: searchValue },
            vendorId: id,
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalProducts = await productModel
          .find({
            $text: { $search: searchValue },
            vendorId: id,
          })
          .countDocuments();
        responseReturn(res, 201, {
          products,
          totalProducts,
          message: 'Products retrieved successfully.',
        });
      } else {
        const products = await productModel
          .find({ vendorId: id })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalProducts = await productModel
          .find({ vendorId: id })
          .countDocuments();
        responseReturn(res, 201, {
          products,
          totalProducts,
          message: 'Products retrieved successfully.',
        });
      }
    } catch (error) {
      console.error(error);
      responseReturn(res, 500, {
        error: 'Internal server error during product retrieval.',
      });
    }
  }; // End of get products method
}

module.exports = new productController();
