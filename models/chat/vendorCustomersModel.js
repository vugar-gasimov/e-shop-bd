const { Schema, model } = require('mongoose');

const vendorCustomersSchema = new Schema(
  {
    myId: {
      type: String,
      required: true,
    },
    friendsId: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('vendor_customers', vendorCustomersSchema);
