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
      console.log(error.message);
    }
  }; // End of get products method

  get_product = async (req, res) => {
    const { productId } = req.params;

    try {
      const product = await productModel.findById(productId);

      responseReturn(res, 201, {
        product,
        message: 'Product retrieved successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get product with id method

  edit_product = async (req, res) => {
    let { name, description, stock, price, discount, brand, productId } =
      req.body;

    if (!productId) {
      responseReturn(res, 400, { error: 'Product ID is required.' });
    }

    name = name?.toString().trim();
    const slug = name.split(' ').join('-');

    try {
      await productModel.findByIdAndUpdate(productId, {
        name,
        description,
        stock,
        price,
        discount,
        brand,
        productId,
        slug,
      });
      const product = await productModel.findById(productId);
      if (!product) {
        responseReturn(res, 404, { error: 'Product not found.' });
      }
      responseReturn(res, 201, {
        product,
        message: 'Product updated successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of edit product with id method

  product_image_edit = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 400, { error: 'Form parsing error' });
      }

      const { oldImage, productId } = fields;
      const { newImage } = files;

      if (!oldImage || !newImage || !productId) {
        responseReturn(res, 400, { error: 'Missing required fields' });
      }

      if (err) {
        responseReturn(res, 400, { error: err.message });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
            secure: true,
          });
          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: 'products',
          });

          if (result) {
            let { images } = await productModel.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await productModel.findByIdAndUpdate(productId, { images });

            const product = await productModel.findById(productId);

            responseReturn(res, 200, {
              product,
              message: 'Image successfully updated',
            });
          } else {
            responseReturn(res, 404, {
              error: 'Failed to upload new image',
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      }
    });
  }; // End of edit product image edit with id method
}

module.exports = new productController();
