const cartModel = require('../../models/cartModel');
const wishlistModel = require('../../models/wishlistModel');
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
    const commission = 5;
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
      const productsInStock = cart_products.filter(
        (p) => p.products[0].stock >= p.quantity
      );
      for (let i = 0; i < productsInStock.length; i++) {
        const { quantity } = productsInStock[i];
        cart_products_count = buy_product_item + quantity;
        buy_product_item = buy_product_item + quantity;
        const { price, discount } = productsInStock[i].products[0];

        if (discount !== 0) {
          calculatePrices =
            calculatePrices +
            quantity * (price - Math.floor((price * discount) / 100));
        } else {
          calculatePrices = calculatePrices + quantity * price;
        }
      } // End of for loop
      let p = [];
      let unique = [
        ...new Set(
          productsInStock.map((p) => p.products[0].vendorId.toString())
        ),
      ];
      for (let i = 0; i < unique.length; i++) {
        let price = 0;
        for (let j = 0; j < productsInStock.length; j++) {
          const tempProduct = productsInStock[j].products[0];
          if (unique[i] === tempProduct.vendorId.toString()) {
            let pri = 0;
            if (tempProduct.discount !== 0) {
              pri =
                tempProduct.price -
                Math.floor((tempProduct.price * tempProduct.discount) / 100);
            } else {
              pri = tempProduct.price;
            }
            pri = pri - Math.floor((pri * commission) / 100);
            price = price + pri * productsInStock[j].quantity;
            p[i] = {
              vendorId: unique[i],
              shopName: tempProduct.shopName,
              price,
              products: p[i]
                ? [
                    ...p[i].products,
                    {
                      _id: productsInStock[j]._id,
                      quantity: productsInStock[j].quantity,
                      productsInfo: tempProduct,
                    },
                  ]
                : [
                    {
                      _id: productsInStock[j]._id,
                      quantity: productsInStock[j].quantity,
                      productsInfo: tempProduct,
                    },
                  ],
            };
          }
        }
      }
      responseReturn(res, 201, {
        cart_products: p,
        price: calculatePrices,
        cart_products_count,
        shipping_fee: 20 * p.length,
        outOfStockProducts,
        buy_product_item,
        message: 'Cart products fetched successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get cart products method

  remove_cart_product = async (req, res) => {
    const { cartId } = req.params;
    try {
      await cartModel.findByIdAndDelete(cartId);
      responseReturn(res, 200, {
        message: 'Product removed successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of remove cart product method

  quantity_increment = async (req, res) => {
    const { cartId } = req.params;
    try {
      const product = await cartModel.findById(cartId);
      const { quantity } = product;
      await cartModel.findByIdAndUpdate(cartId, { quantity: quantity + 1 });
      responseReturn(res, 200, {
        message: 'Product incremented successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of quantity increment method

  quantity_decrement = async (req, res) => {
    const { cartId } = req.params;
    try {
      const product = await cartModel.findById(cartId);
      const { quantity } = product;
      await cartModel.findByIdAndUpdate(cartId, { quantity: quantity - 1 });
      responseReturn(res, 200, {
        message: 'Product decremented successfully',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of quantity decrement method

  add_to_wishlist = async (req, res) => {
    const { slug } = req.body;
    try {
      const product = await wishlistModel.findOne({ slug });
      if (product) {
        responseReturn(res, 404, {
          error: 'Product is already in wishlist.',
        });
      } else {
        await wishlistModel.create(req.body);
        responseReturn(res, 201, {
          message: 'Product is added successfully in wishlist.',
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }; // End of add to wishlist product method

  get_wishlist_products = async (req, res) => {
    const { userId } = req.params;
    try {
      const wishlist = await wishlistModel.find({ userId });
      responseReturn(res, 200, {
        wishlistCount: wishlist.length,
        wishlist,
        message: 'Wishlist products fetched successfully.',
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of get wishlist products method

  remove_wishlist_product = async (req, res) => {
    const { wishlistId } = req.params;

    try {
      const wishlist = await wishlistModel.findByIdAndDelete(wishlistId);
      responseReturn(res, 200, {
        message: 'Wishlist product removed successfully.',
        wishlistId,
      });
    } catch (error) {
      console.log(error.message);
    }
  }; // End of remove wishlist product method
}

module.exports = new cartControllers();
