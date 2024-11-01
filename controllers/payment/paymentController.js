const stripeModel = require('../../models/stripeModel');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(
  'sk_test_51QFzHpCOlW0xYn4EwbUXBHidXrC2LE9UN7oH208sgft5f1NvvakkmnRm1DFWft8ByMxJhiYBgBe6vDXtBvx8JU0i00dE3564hg'
);
const { responseReturn } = require('../../utils/response');

class paymentController {
  create_stripe_connect_account = async (req, res) => {
    const { id } = req;
    const uId = uuidv4();
    try {
      const stripeInfo = await stripeModel.findOne({ vendorId: id });
      if (stripeInfo) {
        await stripeModel.deleteOne({ vendorId: id });
        const account = await stripe.accounts.create({ type: 'express' });

        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: 'http://localhost:3001/refresh',
          return_url: `http://localhost:3001/success?activeCode=${uId}`,
          type: 'account_onboarding',
        });
        await stripeModel.create({
          vendorId: id,
          stripeId: account.id,
          code: uId,
        });
        responseReturn(res, 200, {
          url: accountLink.url,
          message:
            'Stripe Connect account created successfully. Please complete onboarding using the provided link.',
        });
      } else {
        const account = await stripe.accounts.create({ type: 'express' });

        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: 'http://localhost:3001/refresh',
          return_url: `http://localhost:3001/success?activeCode=${uId}`,
          type: 'account_onboarding',
        });
        await stripeModel.create({
          vendorId: id,
          stripeId: account.id,
          code: uId,
        });
        responseReturn(res, 200, {
          url: accountLink.url,
          message:
            'Stripe Connect account created successfully. Please complete onboarding using the provided link.',
        });
      }
    } catch (error) {
      console.log(
        'Failed to create Stripe Connect account. Please try again or contact support.' +
          error.message
      );
    }
  }; // End of create stripe connect account method
}
module.exports = new paymentController();
