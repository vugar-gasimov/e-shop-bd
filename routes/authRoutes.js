const express = require('express');

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authmiddleware');

const router = require('express').Router();

router.post('/admin-login', authController.admin_login);
router.get('/get-user', authMiddleware, authController.getUser);

module.exports = router;
