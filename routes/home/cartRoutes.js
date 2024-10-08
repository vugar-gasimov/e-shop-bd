const cartControllers = require('../../controllers/home/cartControllers');
const router = require('express').Router();

router.post('/home/product/add-to-cart', cartControllers.add_to_cart);
router.get(
  '/home/product/get-cart-products/:userId',
  cartControllers.get_cart_products
);
router.delete(
  '/home/product/remove-cart-product/:cartId',
  cartControllers.remove_cart_product
);
router.put(
  '/home/product/quantity-increment/:cartId',
  cartControllers.quantity_increment
);
router.put(
  '/home/product/quantity-decrement/:cartId',
  cartControllers.quantity_decrement
);

router.post('/home/product/add-to-wishlist', cartControllers.add_to_wishlist);

router.get(
  '/home/product/get-wishlist-products/:userId',
  cartControllers.get_wishlist_products
);

router.delete(
  '/home/product/remove-wishlist-product/:wishlistId',
  cartControllers.remove_wishlist_product
);

module.exports = router;
