const homeControllers = require('../../controllers/home/homeControllers');
const router = require('express').Router();

router.get('/get-categories', homeControllers.getCategories);
router.get('/get-products', homeControllers.getProducts);
router.get('/product-price-range', homeControllers.product_price_range);

module.exports = router;
