const customerAuthControllers = require('../../controllers/home/customerAuthControllers');
const router = require('express').Router();

router.post(
  '/customer/customer-register',
  customerAuthControllers.customer_register
);

module.exports = router;
