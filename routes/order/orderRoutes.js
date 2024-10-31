const orderControllers = require('../../controllers/order/orderControllers');
const router = require('express').Router();

// Customer orders
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

// Admin orders
router.get('/admin/get-orders', orderControllers.get_admin_orders);
router.get('/admin/get-order/:orderId', orderControllers.get_admin_order);
router.put(
  '/admin/update/order-status/:orderId',
  orderControllers.adminUpdateOrderStatus
);

// Vendor orders
router.get('/vendor/get-orders/:vendorId', orderControllers.get_vendor_orders);
router.get('/vendor/get-order/:orderId', orderControllers.get_vendor_order);

module.exports = router;
