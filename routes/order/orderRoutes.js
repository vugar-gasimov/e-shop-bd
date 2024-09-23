const orderControllers = require('../../controllers/order/orderControllers');
const router = require('express').Router();

router.post('/home/order/place-order', orderControllers.place_order);
router.get(
  '/home/customer/get-dashboard/:userId',
  orderControllers.get_dashboard
);
router.get(
  '/home/customer/get-orders/:customerId/:status',
  orderControllers.get_orders
);

module.exports = router;
