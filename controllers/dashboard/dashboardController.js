const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');
const {
  mongo: { ObjectId },
} = require('mongoose');
const { responseReturn } = require('../../utils/response');

const myShopWallet = require('../../models/myShopWallet');
const productModel = require('../../models/productModel');
const customerOrder = require('../../models/customerOrder');
const vendorModel = require('../../models/vendorModel');
const adminVendorMessage = require('../../models/chat/adminVendorMessage');
const vendorWallet = require('../../models/vendorWallet');
const authOrder = require('../../models/authOrder');
const bannerModel = require('../../models/bannerModel');
const vendorCustomerMessageModel = require('../../models/chat/vendorCustomerMessageModel');

class dashboardController {
  get_admin_dashboard = async (req, res) => {
    try {
      const totalSales = await myShopWallet.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      const totalProducts = await productModel.find({}).countDocuments();

      const totalOrders = await customerOrder.find({}).countDocuments();

      const totalVendors = await vendorModel.find({}).countDocuments();

      const chatMessages = await adminVendorMessage.find({}).limit(3);

      const recentOrders = await customerOrder.find({}).limit(5);

      responseReturn(res, 200, {
        totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
        totalProducts,
        totalOrders,
        totalVendors,
        chatMessages,
        recentOrders,
        message: 'Admin dashboard data fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        message: 'Internal Server Error',
      });
    }
  }; // End of get admin dashboard data method

  get_vendor_dashboard = async (req, res) => {
    const { id } = req;

    try {
      const totalSales = await vendorWallet.aggregate([
        {
          $match: {
            vendorId: { $eq: id },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      const totalProducts = await productModel
        .find({ vendorId: new ObjectId(id) })
        .countDocuments();

      const totalOrders = await authOrder
        .find({ vendorId: new ObjectId(id) })
        .countDocuments();

      const totalPendingOrders = await authOrder
        .find({
          $and: [
            {
              vendorId: {
                $eq: new ObjectId(id),
              },
            },
            {
              delivery_status: {
                $eq: 'pending',
              },
            },
          ],
        })
        .countDocuments();

      const recentMessages = await vendorCustomerMessageModel
        .find({
          $or: [
            {
              senderId: {
                $eq: id,
              },
            },
            {
              receiverId: {
                $eq: id,
              },
            },
          ],
        })
        .limit(3);

      const recentOrders = await authOrder
        .find({
          vendorId: new ObjectId(id),
        })
        .limit(5);

      responseReturn(res, 200, {
        totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
        totalProducts,
        totalOrders,
        totalPendingOrders,
        recentMessages,
        recentOrders,
        message: 'Vendor dashboard data fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        message: 'Internal Server Error',
      });
    }
  }; // End of get vendor dashboard data method

  add_banner = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      const { productId } = field;
      const { mainBanner } = files;

      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true,
      });

      try {
        const { slug } = await productModel.findById(productId);
        const result = await cloudinary.uploader.upload(mainBanner.filepath, {
          folder: 'banners',
        });
        const banner = await bannerModel.create({
          productId,
          banner: result.url,
          link: slug,
        });
        responseReturn(res, 200, {
          message: 'Product banner added successfully.',
          banner,
        });
      } catch (error) {
        console.log(error.message);
        responseReturn(res, 500, {
          message: 'Internal Server Error',
        });
      }
    });
  }; // End of post add banner image method

  get_banner = async (req, res) => {
    const { productId } = req.params;
    try {
      const banner = await bannerModel.findOne({
        productId: new ObjectId(productId),
      });
      responseReturn(res, 200, {
        message: 'Product banner fetched successfully.',
        banner,
      });
    } catch (error) {
      console.log(error.message);
      responseReturn(res, 500, {
        message: 'Internal Server Error',
      });
    }
  }; // End of get banner by product id method

  update_banner = async (req, res) => {
    const { bannerId } = req.params;
    const form = formidable({ multiples: false });

    form.parse(req, async (err, _, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return responseReturn(res, 400, {
          message: 'Failed to parse form data.',
        });
      }

      const { mainBanner } = files;

      if (!mainBanner) {
        return responseReturn(res, 400, {
          message: 'Banner image is required.',
        });
      }

      try {
        cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.CLOUD_API_KEY,
          api_secret: process.env.CLOUD_API_SECRET,
          secure: true,
        });

        let banner = await bannerModel.findById(bannerId);
        if (!banner) {
          return responseReturn(res, 404, { message: 'Banner not found.' });
        }
        let temp = banner.banner.split('/');
        temp = temp[temp.length - 1];
        const imageName = temp.split('.')[0];

        // Delete the existing image from Cloudinary
        await cloudinary.uploader.destroy(imageName);

        const { url } = await cloudinary.uploader.upload(mainBanner.filepath, {
          folder: 'banners',
        });

        await bannerModel.findByIdAndUpdate(bannerId, { banner: url });
        banner = await bannerModel.findById(bannerId);

        responseReturn(res, 200, {
          message: 'Product banner updated successfully.',
          banner,
        });
      } catch (error) {
        console.error('Error updating banner:', error.message);
        responseReturn(res, 500, {
          message: 'Internal Server Error',
        });
      }
    });
  }; // End of update banner by id method.

  get_banners = async (req, res) => {
    try {
      const banners = await bannerModel.aggregate([
        {
          $sample: {
            size: 5,
          },
        },
      ]);
      responseReturn(res, 200, {
        message: 'Product banners fetched successfully.',
        banners,
      });
    } catch (error) {
      console.error('Error getting banners:', error.message);
      responseReturn(res, 500, {
        message: 'Internal Server Error',
      });
    }
  }; // End of get banners method
}

module.exports = new dashboardController();
