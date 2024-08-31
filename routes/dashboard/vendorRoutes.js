const express = require('express');

const { authMiddleware } = require('../../middlewares/authMiddleware');
const vendorController = require('../../controllers/dashboard/vendorController');

const router = require('express').Router();

router.get('/get-vendors', authMiddleware, vendorController.getVendors);
router.get('/get-vendor/:vendorId', authMiddleware, vendorController.getVendor);

module.exports = router;
