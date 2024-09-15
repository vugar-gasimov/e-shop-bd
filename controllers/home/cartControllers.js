const cartModel = require('../../models/cartModel');
const { responseReturn } = require('../../utils/response');
const {
  mongo: { ObjectId },
} = require('mongoose');
class cartControllers {
  add_to_cart = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity < 1) {
      responseReturn(res, 400, {
        message:
          'Invalid input. Ensure all fields are provided and quantity is at least 1.',
      });
    }

    try {
      const existingProduct = await cartModel.findOne({
        $and: [
          {
            userId: {
              $eq: userId,
            },

            productId: {
              $eq: productId,
            },
          },
        ],
      });
      if (existingProduct) {
        responseReturn(res, 404, {
          error: 'This product already is in cart.',
        });
      } else {
        const newProduct = await cartModel.create({
          userId: userId,
          productId: productId,
          quantity: quantity,
        });
        responseReturn(res, 201, {
          product: newProduct,
          message: 'Product added to cart successfully',
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; // End of add to cart method

  get_cart_products = async (req, res) => {
    const { userId } = req.params;

    try {
      const cart_products = await cartModel.aggregate([
        {
          $match: {
            userId: {
              $eq: new ObjectId(userId),
            },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'products',
          },
        },
      ]);
      let buy_product_item = 0;
      let calculatePrices = 0;
      let cart_products_count = 0;
      const outOfStockProducts = cart_products.filter(
        (p) => p.products[0].stock < p.quantity
      );
      for (let i = 0; i < outOfStockProducts.length; i++) {
        cart_products_count =
          cart_products_count + outOfStockProducts[i].quantity;
      }

      console.log(outOfStockProducts);
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get cart products method
}

module.exports = new cartControllers();
