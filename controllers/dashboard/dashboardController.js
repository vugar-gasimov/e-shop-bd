const { responseReturn } = require('../../utils/response');

const myShopWallet = require('../../models/myShopWallet');
const productModel = require('../../models/productModel');
const customerOrder = require('../../models/customerOrder');
const vendorModel = require('../../models/vendorModel');
const adminVendorMessage = require('../../models/chat/adminVendorMessage');

class dashboardController {
  get_admin_dashboard = async (req, res) => {
    const { id } = req;

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
}

module.exports = new dashboardController();
