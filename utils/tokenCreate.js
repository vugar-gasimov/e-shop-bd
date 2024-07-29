const jwt = require('jsonwebtoken');

module.exports.createToken = async (data) => {
  try {
    if (!process.env.SECRET) {
      throw new Error('JWT secret is not defined in environment variables');
    }

    const token = await jwt.sign(data, process.env.SECRET, { expiresIn: '7d' });
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw new Error('Token creation failed');
  }
};
