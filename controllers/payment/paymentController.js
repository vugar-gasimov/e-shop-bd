require('dotenv').config();
const stripeModel = require('../../models/stripeModel');
const vendorModel = require('../../models/vendorModel');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { responseReturn } = require('../../utils/response');

class paymentController {
  create_stripe_connect_account = async (req, res) => {
    const { id } = req;
    const uId = uuidv4();
    try {
      const stripeInfo = await stripeModel.findOne({ vendorId: id });
      if (stripeInfo) {
        await stripeModel.deleteOne({ vendorId: id });
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'PL',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

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
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'PL',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

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

  active_stripe_connect_account = async (req, res) => {
    const { activeCode } = req.params;
    const { id } = req;
    try {
      const userStripeInfo = await stripeModel.findOne({ code: activeCode });
      if (userStripeInfo) {
        await vendorModel.findByIdAndUpdate(id, { payment: 'active' });
        responseReturn(res, 200, { message: 'Payment success Active.' });
      } else {
        responseReturn(res, 200, { message: 'Payment success Active.' });
      }
    } catch (error) {
      responseReturn(res, 500, { message: 'Internal Server Error' });
    }
  }; // End of put active stripe connect account method
}
module.exports = new paymentController();
