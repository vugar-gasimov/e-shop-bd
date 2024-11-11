const express = require('express');
const { authMiddleware } = require('../../middlewares/authMiddleware');
const dashboardController = require('../../controllers/dashboard/dashboardController');

const router = require('express').Router();

router.get(
  '/admin/get-dashboard',
  authMiddleware,
  dashboardController.get_admin_dashboard
);

module.exports = router;
