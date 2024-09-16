const { Schema, model } = require('mongoose');

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = model('cartProducts', cartSchema);
