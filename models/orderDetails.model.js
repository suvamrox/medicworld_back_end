const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderDetailsSchema = new Schema({
  orderID: {
    type: Schema.Types.ObjectId,
    ref: 'orders',
    required: true,
  },
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
  productTitle: String,
  productPrice: Number,
  productQty: Number,
  shipping_discount: Number,
  productTotal: Number
}, {
  collection: 'orderDetails',
  timestamps: true,
});

module.exports = mongoose.model('orderDetails', orderDetailsSchema);
