const jwt = require('jsonwebtoken');

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res
      .status(401)
      .json({ error: 'Authentication required. Please log in.' });
  } else {
    try {
      const decodeToken = await jwt.verify(accessToken, process.env.SECRET);
      req.role = decodeToken.role;
      req.id = decodeToken.id;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  }
};
