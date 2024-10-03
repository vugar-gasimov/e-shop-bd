const { Schema, model } = require('mongoose');

const vendorCustomersMessageSchema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'unseen',
    },
  },
  { timestamps: true }
);

module.exports = model(
  'vendor_customers_messages',
  vendorCustomersMessageSchema
);
