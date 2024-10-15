const { Schema, model } = require('mongoose');

const adminVendorMessageSchema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      default: '',
    },
    receiverId: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['seen', 'unseen'],
      default: 'unseen',
    },
  },
  { timestamps: true }
);

module.exports = model('admin_vendor_messages', adminVendorMessageSchema);
