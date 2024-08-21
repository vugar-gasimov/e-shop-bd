const express = require('express');

const { authMiddleware } = require('../../middlewares/authMiddleware');
const categoryController = require('../../controllers/dashboard/categoryController');

const router = require('express').Router();

router.post('/add-category', authMiddleware, categoryController.add_category);

router.get(
  '/get-category-info',
  authMiddleware,
  categoryController.getCategory
);

module.exports = router;
