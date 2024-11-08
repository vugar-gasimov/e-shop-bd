const { Schema, model } = require('mongoose');

const withdrawRequestSchema = new Schema(
  {
    vendorId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = model('withdrawRequests', withdrawRequestSchema);
