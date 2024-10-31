const { Schema, model } = require('mongoose');

const stripeSchema = new Schema(
  {
    vendorId: {
      type: Schema.ObjectId,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('stripes', stripeSchema);
