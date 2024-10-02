const chatController = require('../controllers/chat/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.post('/chat/customer/add-friend', chatController.add_friend);

module.exports = router;
