const chatController = require('../controllers/chat/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/chat/customer/add-friend', chatController.add_friend);
router.post('/chat/customer/send-message', chatController.send_message);

router.get(
  '/chat/vendor/get-customers/:vendorId',
  chatController.get_customers
);

module.exports = router;
