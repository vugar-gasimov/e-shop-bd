const chatController = require('../controllers/chat/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/chat/customer/add-friend', chatController.add_friend);
// send message to vendor
router.post('/chat/customer/send-message', chatController.send_message);

router.get(
  '/chat/vendor/get-customers/:vendorId',
  chatController.get_customers
);
router.get(
  '/chat/vendor/get-customer-message/:customerId',
  authMiddleware,
  chatController.get_customer_message
);
router.post(
  '/chat/vendor/send-message-customer',
  authMiddleware,
  chatController.send_message_customer
);

router.get(
  '/chat/admin/get-vendors',
  authMiddleware,
  chatController.get_vendors
);

router.post(
  '/chat/send-admin-message',
  authMiddleware,
  chatController.send_admin_message
);

router.get(
  '/chat/get-admin-messages/:receiverId',
  authMiddleware,
  chatController.get_admin_messages
);
router.get(
  '/chat/get-vendor-messages',
  authMiddleware,
  chatController.get_vendor_messages
);

module.exports = router;
