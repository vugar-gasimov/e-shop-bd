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
          error: 'Email address is already in use.',
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
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        responseReturn(res, 201, {
          token,
          success: true,
          message: 'Customer registered successfully',
        });
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  // End of post customer register method

  customer_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const customer = await customerModel
        .findOne({ email })
        .select('+password');
      if (customer) {
        const isMatch = await bcrypt.compare(password, customer.password);
        if (isMatch) {
          const token = await createToken({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            method: customer.method,
          });
          res.cookie('customerToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
          responseReturn(res, 200, {
            token,
            success: true,
            message: 'Customer login successful',
          });
        } else {
          responseReturn(res, 401, {
            error: 'Incorrect password.',
          });
        }
      } else {
        responseReturn(res, 409, {
          error: 'Email address does not exist.',
        });
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  // End of post customer login method
}

module.exports = new customerAuthControllers();
