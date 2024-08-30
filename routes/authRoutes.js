const express = require('express');

const authControllers = require('../controllers/authControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/admin-login', authControllers.admin_login);
router.post('/vendor-login', authControllers.vendor_login);
router.get('/get-user-info', authMiddleware, authControllers.getUser);
router.post('/vendor-register', authControllers.vendor_register);
router.post('/upload-image', authMiddleware, authControllers.uploadImage);
router.post(
  '/add-profile-info',
  authMiddleware,
  authControllers.addProfileInfo
);

module.exports = router;
