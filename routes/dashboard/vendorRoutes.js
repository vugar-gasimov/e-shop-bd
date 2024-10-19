const express = require('express');

const { authMiddleware } = require('../../middlewares/authMiddleware');
const vendorController = require('../../controllers/dashboard/vendorController');

const router = require('express').Router();

router.get('/get-vendors', authMiddleware, vendorController.getVendors);
router.get('/get-vendor/:vendorId', authMiddleware, vendorController.getVendor);
router.post(
  '/update-vendor-status',
  authMiddleware,
  vendorController.updateVendorStatus
);

router.get(
  '/get-active-vendors',
  authMiddleware,
  vendorController.get_activeVendors
);

module.exports = router;
