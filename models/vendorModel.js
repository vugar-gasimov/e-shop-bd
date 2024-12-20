const { Schema, model } = require('mongoose');

const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      default: 'vendor',
    },
    status: {
      type: String,
      default: 'pending',
    },
    payment: {
      type: String,
      default: 'inactive',
    },
    method: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    shopInfo: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

vendorSchema.index(
  {
    name: 'text',
    email: 'text',
  },
  {
    weights: {
      name: 5,
      email: 4,
    },
  }
);

module.exports = model('vendors', vendorSchema);
