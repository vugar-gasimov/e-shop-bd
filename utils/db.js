const mongoose = require('mongoose');

module.exports.dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
    console.log('Database connected successfully.');
  } catch (error) {
    console.log('Database connection error:', error.message);
  }
};
//useUnifiedTopology: true, to ensure compatibility with newer MongoDB drivers.
