const customerModel = require('../../models/customerModel');
const { responseReturn } = require('../../utils/response');
const bcrypt = require('bcrypt');
const vendorCustomersSchema = require('../../models/chat/vendorCustomersModel');
const { createToken } = require('../../utils/tokenCreate');

class customerAuthControllers {
  customer_register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const customer = await customerModel.findOne({ email });
      if (customer) {
        responseReturn(res, 409, {
          success: false,
          message: 'Email address is already in use.',
        });
      } else {
        const createdCustomer = await customerModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password, 11),
          method: 'manually',
        });
        await vendorCustomersSchema.create({
          myId: createdCustomer.id,
        });
        const token = await createToken({
          id: createdCustomer.id,
          name: createdCustomer.name,
          email: createdCustomer.email,
          method: createdCustomer.method,
        });

        res.cookie('customerToken', token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          // secure: process.env.NODE_ENV === 'production',
          // sameSite: 'strict',
        });

        responseReturn(res, 201, {
          token,
          success: true,
          message: 'Customer registered successfully',
        });
      }
    } catch (error) {
      console.error('Error during customer registration:', error);

      responseReturn(res, 500, {
        success: false,
        message: 'An error occurred during customer registration',
      });
    }
  };
  // End of post customer register method
}

module.exports = new customerAuthControllers();
