const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ordersSchema = new Schema({
  customerID: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  contactDetails: {
    name: String,
    phoneNo: Number,
    email: String,
  },
  paymentDetails: {
    pamentType: String, // paypal or strip or paytm or rez or cod
    pamentJsone: String, // Strore JSONE as a String
  },
  totalPrice: Number,
  saleTex: Number,
  subtotal: Number, // after discount * if discount avalable
  shippingDiscount: Number, // discount %
  deliveryFee: Number,
  shipperID: String,
  address: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    state: String,
    city: String,
    zipCode: Number,
    phone: Number,
    landmark: String
  },
  orderDetails: [{
    type: Schema.Types.ObjectId,
    ref: 'orderDetails',
  }],
  deviceType: {
    type: String,
    default: 'web',
  },
  orderType: {//? single order or multiple vendor order, new app accept single order
    //s => single, m=> multiple
    type: String,
    default: 'm',
  },
  couponCode: String,
  orderStatus: {
    type: Number,
    default: 1,
  }// Pending payment ,Processing, 1>OnHold, 2>Accept, 3>Cancelled, 4>DeliverToDriver, 5>Completed,6>Failed,7>Returned,8>Refunded
}, {
  collection: 'orders',
  timestamps: true,
});
module.exports = mongoose.model('orders', ordersSchema);
