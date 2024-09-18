const moment = require('moment');
const authOrderModel = require('../../models/authOrder');
const custOrderModel = require('../../models/customerOrder');
const cartModel = require('../../models/cartModel');
const { responseReturn } = require('../../utils/response');
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
      for (let i = 0; i < cartId.length; i++) {
        await cartModel.findByIdAndDelete(cartId[i]);
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
}
module.exports = new orderControllers();
