const adminModel = require('../models/adminModel');
const vendorModel = require('../models/vendorModel');
const { responseReturn } = require('../utils/response');
const bcrypt = require('bcrypt');
const { createToken } = require('../utils/tokenCreate');
const vendorCustomersModel = require('../models/chat/vendorCustomersModel');
const cloudinary = require('cloudinary').v2;
const { formidable } = require('formidable');

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

  vendor_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const vendor = await vendorModel.findOne({ email }).select('+password');

      if (vendor) {
        const match = await bcrypt.compare(password, vendor.password);
        if (match) {
          const token = await createToken({
            id: vendor.id,
            role: vendor.role,
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
        responseReturn(res, 404, { error: 'Vendor not found' });
      }
    } catch (error) {
      console.error('Error during vendor login:', error);
      responseReturn(res, 500, { error: 'An error occurred during login' });
    }
  }; // End of vendor_login

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
        responseReturn(res, 200, { userInfo: user });
      } else {
        const vendor = await vendorModel.findById(id);
        responseReturn(res, 200, { userInfo: vendor });
      }
    } catch (error) {
      responseReturn(res, 500, {
        error: 'An error occurred while fetching user data',
      });
    }
  }; // End of getUser

  uploadImage = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 400, { error: 'Form parsing error' });
      }

      const { image } = files;

      if (!image) {
        return responseReturn(res, 400, { error: 'No image file provided' });
      }

      try {
        cloudinary.config({
          cloud_name: process.env.CLOUD_NAME,
          api_key: process.env.CLOUD_API_KEY,
          api_secret: process.env.CLOUD_API_SECRET,
          secure: true,
        });

        const result = await cloudinary.uploader.upload(image.filepath, {
          folder: 'profile-image',
        });

        if (result) {
          await vendorModel.findByIdAndUpdate(id, {
            image: result.url,
          });

          const userInfo = await vendorModel.findById(id);

          responseReturn(res, 201, {
            userInfo,
            message: 'Image uploaded successfully.',
          });
        } else {
          responseReturn(res, 500, { error: 'Image upload failed' });
        }
      } catch (error) {
        console.error(error);
        responseReturn(res, 500, { error: 'Internal server error' });
      }
    });
  }; // End of upload Image
}
module.exports = new authControllers();
