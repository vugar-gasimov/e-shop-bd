const homeControllers = require('../../controllers/home/homeControllers');
const router = require('express').Router();

router.get('/get-categories', homeControllers.getCategories);
router.get('/get-products', homeControllers.getProducts);
router.get('/product-price-range', homeControllers.product_price_range);
router.get('/query-products', homeControllers.query_products);
router.get('/product-details/:slug', homeControllers.product_details);

module.exports = router;
