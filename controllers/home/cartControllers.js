const cartModel = require('../../models/cartModel');
const { responseReturn } = require('../../utils/response');

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
}

module.exports = new cartControllers();
