const adminModel = require('../models/adminModel');
const vendorModel = require('../models/vendorModel');
const { responseReturn } = require('../utils/response');
const bcrypt = require('bcrypt');
const { createToken } = require('../utils/tokenCreate');
const vendorCustomersModel = require('../models/chat/vendorCustomersModel');

class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select('+password');

      if (admin) {
        const match = await bcrypt.compare(password, admin.password);
        if (match) {
          const token = await createToken({
            id: admin.id,
            role: admin.role,
          });
          res.cookie('accessToken', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true, // Added for security
          });
          responseReturn(res, 200, {
            token,
            message: 'Login successful',
          });
        } else {
          responseReturn(res, 401, { error: 'Wrong password' });
        }
      } else {
        responseReturn(res, 404, { error: 'Admin not found' });
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      responseReturn(res, 500, { error: 'An error occurred during login' });
    }
  }; // End of admin_login

  vendor_register = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      const getUser = await vendorModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: 'Email already exists' });
      } else {
        const vendor = await vendorModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: 'manually',
          shopInfo: {},
        });
        await vendorCustomersModel.create({ myId: vendor.id });
        const token = await createToken({
          id: vendor.id,
          role: vendor.role,
        });

        res.cookie('accessToken', token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        responseReturn(res, 201, {
          token,
          message: 'Registered successfully.',
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: 'Internal server error.' });
    }
  }; // End of vendor_register

  getUser = async (req, res) => {
    const { id, role } = req;
    try {
      if (role === 'admin') {
        const user = await adminModel.findById(id);
        if (user) {
          responseReturn(res, 200, { userInfo: user });
        } else {
          responseReturn(res, 404, { error: 'User not found' });
        }
      } else {
        console.log('Vendor Info');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      responseReturn(res, 500, {
        error: 'An error occurred while fetching user data',
      });
    }
  }; // End of getUser
}
module.exports = new authControllers();
