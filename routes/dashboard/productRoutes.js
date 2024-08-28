const express = require('express');

const { authMiddleware } = require('../../middlewares/authMiddleware');
const productController = require('../../controllers/dashboard/productController');

const router = require('express').Router();

router.post('/add-product', authMiddleware, productController.add_product);

router.get('/get-products', authMiddleware, productController.get_products);

router.get(
  '/get-product/:productId',
  authMiddleware,
  productController.get_product
);
router.post('/edit-product', authMiddleware, productController.edit_product);

module.exports = router;
