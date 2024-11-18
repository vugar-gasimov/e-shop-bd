const express = require('express');

const { authMiddleware } = require('../../middlewares/authMiddleware');
const categoryController = require('../../controllers/dashboard/categoryController');

const router = require('express').Router();

router.post('/add-category', authMiddleware, categoryController.add_category);

router.get('/get-categories', authMiddleware, categoryController.getCategories);

router.put(
  '/edit/category/:id',
  authMiddleware,
  categoryController.editCategory
);

module.exports = router;
