const moment = require('moment');
const {
  mongo: { ObjectId },
} = require('mongoose');

const { responseReturn } = require('../../utils/response');

const cartModel = require('../../models/cartModel');
const authOrderModel = require('../../models/authOrder');
const custOrderModel = require('../../models/customerOrder');
class orderControllers {
  payment_check = async (id) => {
    try {
      const order = await custOrderModel.findById(id);
      if (order.payment_status === 'unpaid') {
        await custOrderModel.findByIdAndUpdate(id, {
          delivery_status: 'cancelled',
        });
        await authOrderModel.updateMany(
          {
            orderId: id,
          },
          { delivery_status: 'cancelled' }
        );
      }
      return true;
    } catch (error) {
      console.log(error.message);
    }
  }; // End of payment check method =====================

  place_order = async (req, res) => {
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;

    let authOrderData = [];
    let cartId = [];
    const tempDate = moment(Date.now()).format('LLL');

    let custOrderProduct = [];

    for (let i = 0; i < products.length; i++) {
      const pro = products[i].products;
      for (let j = 0; j < pro.length; j++) {
        const tempCusPro = pro[j].productsInfo;
        tempCusPro.quantity = pro[j].quantity;
        custOrderProduct.push(tempCusPro);
        if (pro[j]._id) {
          cartId.push(pro[j]._id);
        }
      }
    }
    try {
      const order = await custOrderModel.create({
        customerId: userId,
        shippingInfo,
        products: custOrderProduct,
        price: price + shipping_fee,
        payment_status: 'unpaid',
        delivery_status: 'pending',
        date: tempDate,
      });
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].products;
        const pri = products[i].price;
        const vendorId = products[i].vendorId;
        let storePros = [];
        for (let j = 0; j < pro.length; j++) {
          const temporaryPro = pro[j].productsInfo;
          temporaryPro.quantity = pro[j].quantity;
          storePros.push(temporaryPro);
        }
        authOrderData.push({
          orderId: order.id,
          vendorId,
          products: storePros,
          price: pri,
          payment_status: 'unpaid',
          shippingInfo: 'Easy Main Warehouse.',
          delivery_status: 'pending',
          date: tempDate,
        });
      }
      await authOrderModel.insertMany(authOrderData);
      for (let k = 0; k < cartId.length; k++) {
        await cartModel.findByIdAndDelete(cartId[k]);
      }

      setTimeout(() => {
        this.payment_check(order.id);
      }, 15000);
      responseReturn(res, 200, {
        orderId: order.id,
        message: 'Order created successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of place order method =====================

  get_dashboard = async (req, res) => {
    const { userId } = req.params;

    try {
      const recentOrders = await custOrderModel
        .find({
          customerId: new ObjectId(userId),
        })
        .limit(5);

      const pendingOrders = await custOrderModel
        .find({
          customerId: new ObjectId(userId),
          delivery_status: ' pending',
        })
        .countDocuments();

      const totalOrders = await custOrderModel
        .find({
          customerId: new ObjectId(userId),
        })
        .countDocuments();

      const cancelledOrders = await custOrderModel
        .find({
          customerId: new ObjectId(userId),
          delivery_status: ' cancelled',
        })
        .countDocuments();

      responseReturn(res, 200, {
        recentOrders,
        pendingOrders,
        totalOrders,
        cancelledOrders,
        message: 'Customer dashboard data fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get customer dashboard index data method =====================

  get_orders = async (req, res) => {
    const { customerId, status } = req.params;

    try {
      let orders = [];
      if (status !== 'all') {
        orders = await custOrderModel.find({
          customerId: new ObjectId(customerId),
          delivery_status: status,
        });
      } else {
        orders = await custOrderModel.find({
          customerId: new ObjectId(customerId),
        });
      }
      responseReturn(res, 200, {
        orders,
        message: 'Customer orders data fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get orders data method =====================

  get_order_info = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await custOrderModel.findById(orderId);
      responseReturn(res, 200, {
        order,
        message: 'Customer order info fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get order info method =====================

  // Admin Orders
  get_admin_orders = async (req, res) => {
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);

    const skipPage = perPage * (page - 1);

    try {
      if (searchValue) {
      } else {
        const orders = await custOrderModel
          .aggregate([
            {
              $lookup: {
                from: 'authorders',
                localField: '_id',
                foreignField: 'orderId',
                as: 'suborder',
              },
            },
          ])
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalOrders = await custOrderModel.aggregate([
          {
            $lookup: {
              from: 'authorders',
              localField: '_id',
              foreignField: 'orderId',
              as: 'suborder',
            },
          },
        ]);
        responseReturn(res, 200, {
          orders,
          totalOrders: totalOrders.length,
          message: 'Admin orders fetched successfully.',
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get admin orders method. =====================

  get_admin_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await custOrderModel.aggregate([
        {
          $match: { _id: new ObjectId(orderId) },
        },
        {
          $lookup: {
            from: 'authorders',
            localField: '_id',
            foreignField: 'orderId',
            as: 'suborder',
          },
        },
      ]);
      responseReturn(res, 200, {
        order: order[0],
        message: 'Admin order details fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get admin order details. =====================

  adminUpdateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
      await custOrderModel.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, {
        message: 'Admin updated order status successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of admin update oder status method

  // Vendor Orders
  get_vendor_orders = async (req, res) => {
    const { vendorId } = req.params;
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);

    const skipPage = perPage * (page - 1);
    try {
      if (searchValue) {
      } else {
        const orders = await authOrderModel
          .find({ vendorId })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalOrders = await authOrderModel
          .find({ vendorId })
          .countDocuments();
        responseReturn(res, 200, {
          orders,
          totalOrders,
          message: 'Vendor orders fetched successfully.',
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get vendor orders method

  get_vendor_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await authOrderModel.findById(orderId);

      responseReturn(res, 200, {
        order,
        message: 'Vendor order details fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get vendor order details. =====================

  vendorUpdateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
      await authOrderModel.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, {
        message: 'Vendor updated order status successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of vendor update oder status method
}
module.exports = new orderControllers();
