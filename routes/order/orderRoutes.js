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
router.get(
  '/home/customer/get-order-info/:orderId',
  orderControllers.get_order_info
);

module.exports = router;
