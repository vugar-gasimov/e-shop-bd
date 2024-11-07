const { Schema, model } = require('mongoose');

const vendorWalletSchema = new Schema(
  {
    vendorId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('vendorWallets', vendorWalletSchema);
