const stripeModel = require('../../models/stripeModel');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(
  'sk_test_51QFzHpCOlW0xYn4EwbUXBHidXrC2LE9UN7oH208sgft5f1NvvakkmnRm1DFWft8ByMxJhiYBgBe6vDXtBvx8JU0i00dE3564hg'
);
const { responseReturn } = require('../../utils/response');

class paymentController {
  create_stripe_connect_account = async (req, res) => {
    // const {} = req.body;
    // try {
    //   const admin = await adminModel.findOne({ email }).select('+password');
    //   responseReturn(res, 200, {
    //     message: '',
    //   });
    // } catch (error) {
    //   console.log(error.message);
    // }
  }; // End of create stripe connect account method
}
module.exports = new paymentController();
