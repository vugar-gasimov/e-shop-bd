const homeControllers = require('../../controllers/home/homeControllers');
const router = require('express').Router();

router.get('/get-categories', homeControllers.getCategories);
router.get('/get-products', homeControllers.getProducts);

module.exports = router;
