/* eslint-disable camelcase */
/* eslint-disable new-cap */
// app payment controller
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');
const stripe = require('stripe')('sk_test_76l3dycZihkpUAMqBbj14GA3');
const order = require('../models/order.model');
const OrderDetails = require('../models/orderDetails.model');
const email_send = require('../config/mail');
const sms_send = require('../config/sms');
const Coupon = require('../config/tokenGen');
const Fcm = require('../function/fcm');
const SellerFcm = require('../function/seller.fcm');
const franFcm = require('../function/fran.fcm');
const adminFcm = require('../function/admin.fcm');
const decriesCouponQty = require('../function/decriesCouponQty');
// import config file
const EnvMod = require('../config/envType');
let Config; // ? "Live" for production "Test" for testing
if (EnvMod.mode === 'Live') {
  Config = require('../config/liveEnv');
} else {
  Config = require('../config/testEnv');
}
const rzp = new Razorpay({
  key_id: Config.rzp.key_id,
  key_secret: Config.rzp.key_secret,
});

paypal.configure({
  mode: 'sandbox', // sandbox or live
  client_id: 'Ac9GbqJJjIahRjmRNR8_uyqnhuFEmd7c5jwwgnERRJVuU-u3onayNYr3pJVJSLLspZgHX_o1skF52cmG',
  client_secret: 'EBmHbahgVJZPLs6izlSS1ZwS4vAgU1aC07jUvdsGqv0NckYyAFp5xhVl0VAv_NLTVJ77glEgV83w7CME',
});

exports.payment = (req, res) => {
  console.log(req.body);
  // res.send(req.body);
  const data = req.body;
  switch (data.payment.type) {
    case 'paypal':
      // code block
      payDone = PayPalAuth(req, res);
      break;
    case 'stripe':
      // code block
      payDone = StripeAuth();
      break;
    case 'razorpay':
      // code block
      payDone = rzpAuth(req, res);
      break;
    case 'cod':
      // code block
      res.json({
        message: 'success',
      });
      saveData(req, {
        cod: "COD"
      });
      break;
    default:
    // code block
  }
};


/**
 * PayPalAuth
 * * for authanticate paypal data
 * @param {Object} req request Object.
 * @param {Object} res responce Object.
 */
function PayPalAuth(req, res) {
  console.log('=============================================================================================');
  console.log('App PayPalAuth controller');
  console.log('=============================================================================================');
  paypal.payment.get(req.body.payment.payJsone.response.id, function (
    error,
    payment
  ) {
    if (error) {
      // console.log(error);
      res.send(error);
    } else {
      console.log('Get Payment Response');
      console.log(JSON.stringify(payment));
      afterAuth(req, res, payment);
    }
  });
}

/**
 * StripeAuth
 * * Capture a Payment
 * @param {Object} req request Object.
 * @param {Object} res responce Object.
 */
function StripeAuth() {
  console.log('=============================================================================================');
  console.log('App strip controller');
  console.log('=============================================================================================');
  stripe.charges.retrieve('ch_1EAHLRIEjw4T1zkFPBqbBJf9', function (err, charge) {
    // asynchronously called
    if (err) {
      console.log(error);
      throw error;
    } else {
      console.log('Get Payment Response');
      console.log(JSON.stringify(charge));
    }
  });
}

/**
 * rzpAuth
 * * Capture a Payment
 * @param {Object} req request Object.
 * @param {Object} res responce Object.
 */
function rzpAuth(req, res) {
  console.log('=============================================================================================');
  console.log('App rzp controller');
  console.log('=============================================================================================');
  console.log('in rzpAuth');
  const paymentID = req.body.payment.payJsone;
  const amount = Number(Number(req.body.total) * 100).toFixed(0);
  // Capture a particular payment
  rzp.payments.capture(paymentID, amount).then((data) => {
    console.log(data);
    // success
    console.log('Get Payment Response rzp');
    res.json({
      message: 'success',
    });
    saveData(req, data);
  }).catch((error) => {
    console.log(error);
    // error
  }); // capture
}

/**
 * saveData
 * *after Capture a Payment it will save ordser to db
 * @param {Object} req  request Object.
 * @param {payment} payment rzp/paypal/strip payment(capture) data.
 */
function saveData(req, payment) {
  //  need to implement check coupon code total item price and moor security
  const supplierIDforFCM = [],
    result = req.user; //User Data
  const newOrder = new order({
    'customerID': result._id,
    'paymentDetails.pamentType': req.body.payment.type,
    'paymentDetails.pamentJsone': JSON.stringify(payment),
    'shipperID': result._id,
    'saleTex': req.body.saleTex,
    'Delivery_Fee': Config.Delivery_Fee,
    'contactDetails.name': result.name,
    'contactDetails.phoneNo': result.local_phone.phone, // save contact details ph No
    'contactDetails.email': result.local.email, // save contact details email
    'address.formatted_address': req.body.address.formatted_address, // save address details
    'address.place_id': req.body.address.place_id, // , ,
    'address.location': {
      lat: req.body.address.location.lat,
      lng: req.body.address.location.lng,
    },
    'address.door': req.body.address.door, // , ,
    'address.landmark': req.body.address.landmark, // , ,
    'address.addresse_type': req.body.address.addresse_type,
    'subtotal': Number(req.body.subtotal),
    'totalPrice': Number(req.body.total),
    // 'shipping_discount': Number(data.shipping_discount),
    ...(req.body.couponID && {
      shipping_discount: `${req.body.shipping_discount}`,
    }),
    ...(req.body.couponID && {
      couponCode: `${req.body.couponID}`,
    }),
    'deviceType': 'app',
  });
  newOrder.save(function (err, doc) {
    // save the order
    if (err) {
      console.log(err);
    }
    console.log(doc);
    /**
     * asyncLoop
     * *creating email and order details
     * @param {int} i User Data.
     * @param {CallableFunction} cb CallableFunction
     */
    function asyncLoop(i, cb) {
      if (i < req.body.items.length) {
        supplierIDforFCM.push(req.body.items[i].supplierId);
        const orderDetails = new OrderDetails({
          orderID: doc._id,
          customerID: doc.customerID,
          productID: mongoose.Types.ObjectId(req.body.items[i]._id),
          supplierID: req.body.items[i].supplierId,
          productPrice: req.body.items[i].price,
          productQty: req.body.items[i].qty,
          productTitle: req.body.items[i].title,
          ...{
            productTotal: req.body.couponID ?
              Coupon.perCal(
                req.body.items[i].qty * req.body.items[i].price,
                req.body.shipping_discount
              ) : req.body.items[i].qty * req.body.items[i].price,
          },
          ...(req.body.couponID && {
            shipping_discount: `${req.body.shipping_discount}`,
          }),
          ...{
            paymentStatus: req.body.payment.type == 'cod' ? false : true
          }
        });
        orderDetails.save(function (err, resut_order) {
          if (err) console.log(err);
          order.findByIdAndUpdate(
            doc._id, {
            $push: {
              orderDetails: resut_order._id,
            },
          },
            function (err) {
              if (err) console.log(err);
              asyncLoop(i + 1, cb);
            }
          );
        });
      } else {
        cb();
      }
    }

    asyncLoop(0, function () {
      OrderDetails.find({
        orderID: doc._id,
      }).populate('productID').exec((err, emailDetails) => {
        const emailOtherDetails = {
          id: doc._id.toString().slice(-7),
          date: new Date().toDateString(),
          name: result.name,
          phoneNo: result.local_phone.phone, // save contact details ph No
          email: result.local.email, // save contact details email
          address: req.body.address.formalAddress, // save address details
          subtotal: Number(req.body.subtotal),
          totalPrice: Number(datreq.bodya.total),
          shipping_discount: Number(req.body.shipping_discount),
        };
        email_send.order_conform_mail(emailDetails, emailOtherDetails, result.local.email);
        if (result.device.device_id) {
          Fcm.orderPlace(result.device.device_id);
        }
      });
      SellerFcm.supplierNewOrder(supplierIDforFCM);
    });
    // sms_send.order_conform_sms(result.name, result.local_phone.phone)
  });
}

// @json
// {
//     "user": {
//         "type": "reg",
//         "id": "xxxxxyyyyyzzzzz"
//     },
//     "payment": {
//         "type": "paypal",
//         "payJsone": "jsone"
//     },
//     "items": [{
//             "id": "xxxxxxxx",
//             "qty": "1",
//             "supplierId": "xxxxyyyyzz",
//             "price": "13",
//             "title": "xyz"
//         },
//         {
//             "id": "xxxxxxxxyyy",
//             "qty": "1",
//             "supplierId": "xxxxyyyyzz",
//             "price": "13",
//             "title": "xyz"
//         }
//     ],
//     "address": {
//         "Name": "suvam",
//         "formalAddress": "kolkata,wb,india",
//         "country": "india",
//         "state": "wb",
//         "city": "kolkata",
//         "zip": "721634",
//         "email": "papa00143@gmail.com",
//         "phone": "83718996353"
//     },
//     "totals": "26"
// }


exports.cancelPayment = (req, res) => {
  sms_send.canclePayment(req.user.local_phone.phone, req.user.local_phone.countryCode);
  res.status(200).send({
    status: true,
  });
};


// for new app
// single vendor payment
exports.singleVendorPayemnt = (req, res) => {
  const paymentID = req.body.payment.payJsone;
  const amount = Number(Number(req.body.total) * 100).toFixed(0);
  // Capture a particular payment
  rzp.payments.capture(paymentID, amount).then((data) => {
    console.log(data);
    // success
    console.log('Get Payment Response rzp');
    res.json({
      message: 'success',
    });
    saveOrder(req, data);
  }).catch((error) => {
    console.log(error);
    // error
  }); // capture

}

exports.singleVendorPayemntCOD = (req, res) => {
  res.json({
    message: 'success',
  });
  saveOrder(req, 'cas on delevary');
}

function saveOrder(req, payment) {
  //  need to implement check coupon code total item price and moor security
  const supplierIDforFCM = [],
    result = req.user; //User Data
  const newOrder = new order({
    'customerID': result._id,
    'paymentDetails.pamentType': req.body.payment.type,
    'paymentDetails.pamentJsone': JSON.stringify(payment),
    'shipperID': result._id,
    'saleTex': req.body.saleTex,
    'Delivery_Fee': req.body.Delivery_Fee,
    'contactDetails.name': result.name,
    'contactDetails.phoneNo': result.local_phone.phone, // save contact details ph No
    'contactDetails.email': result.local.email, // save contact details email
    'address.formatted_address': req.body.address.formatted_address, // save address details
    'address.place_id': req.body.address.place_id, // , ,
    'address.location': {
      lat: req.body.address.location.lat,
      lng: req.body.address.location.lng,
    },
    'address.door': req.body.address.door, // , ,
    'address.landmark': req.body.address.landmark, // , ,
    'address.addresse_type': req.body.address.addresse_type,
    'subtotal': Number(req.body.subtotal),
    'totalPrice': Number(req.body.total),
    ...(req.body.couponID && {
      shipping_discount: `${req.body.shipping_discount}`,
    }),
    ...(req.body.couponID && {
      couponCode: `${req.body.couponID}`,
    }),
    'orderType': 's',
    'restaurantID': req.body.rsID,
    'deviceType': 'app',
  });

  newOrder.save(function (err, doc) {
    // save the order
    if (err) {
      console.log(err);
    }
    console.log(doc);
    /**
     * asyncLoop
     * *creating email and order details
     * @param {int} i User Data.
     * @param {CallableFunction} cb CallableFunction
     */
    function asyncLoop(i, cb) {
      if (i < req.body.items.length) {
        const orderDetails = new OrderDetails({
          orderID: doc._id,
          customerID: doc.customerID,
          productID: mongoose.Types.ObjectId(req.body.items[i]._id),
          supplierID: req.body.items[i].supplierId,
          productPrice: req.body.items[i].price,
          productQty: req.body.items[i].qty,
          productTitle: req.body.items[i].title,
          ...{
            productTotal: req.body.couponID ?
              Coupon.perCal(
                req.body.items[i].qty * req.body.items[i].price,
                req.body.shipping_discount
              ) : req.body.items[i].qty * req.body.items[i].price,
          },
          ...(req.body.couponID && {
            shipping_discount: `${req.body.shipping_discount}`,
          }),
          ...{
            paymentStatus: req.body.payment.type == 'cod' ? false : true
          }
        });

        orderDetails.save(function (err, resut_order) {
          if (err) console.log(err);
          order.findByIdAndUpdate(
            doc._id, {
            $push: {
              orderDetails: resut_order._id,
            },
          },
            function (err) {
              if (err) console.log(err);
              asyncLoop(i + 1, cb);
            }
          );
        });

      } else {
        cb();
      }
    }

    asyncLoop(0, function () {
      email_send.order_conform_mail(req.body, req.user, doc._id);
      if (result.device.device_id) {
        Fcm.orderPlace(result.device.device_id);
      }
      SellerFcm.supplierNewOrder(req.body.rsID);
      franFcm.franNewOrder(req.body.rsID);
      adminFcm.sendFcmNotification();
      req.body.couponID ? decriesCouponQty.dcp(req.body.couponID) : console.log("no coupon cod for decrise");
    });
    // sms_send.order_conform_sms(result.name, result.local_phone.phone)
  })

}

exports.cod = async (req, res, next) => {
  console.log(req.body);
  const orderDetailsIds = [];
  try {
    const newOrder = new order({
      'customerID': req.user._id,
      'paymentDetails.pamentType': req.body.payment.type,
      'paymentDetails.pamentJsone': JSON.stringify(req.body.payment),
      'shipperID': result.shipperID?._id,
      'saleTex': req.body.saleTex,
      'deliveryFee': req.body.Delivery_Fee,
      'address': req.body.address,
      'subtotal': Number(req.body.subtotal),
      'totalPrice': Number(req.body.total),
      ...(req.body.couponID && {
        shipping_discount: `${req.body.shipping_discount}`,
      }),
      ...(req.body.couponID && {
        couponCode: `${req.body.couponID}`,
      }),
      'orderType': 's',
      'deviceType': 'app'
    });
    const newOrderResult = await newOrder.save();

    for (let i = 0; i < req.body.items.length; i++) {
      const orderDetails = new OrderDetails({
        orderID: newOrderResult._id,
        customerID: req.user.id,
        productID: mongoose.Types.ObjectId(req.body.items[i]._id),
        supplierID: req.body.items[i].supplierId,
        productPrice: req.body.items[i].price,
        productQty: req.body.items[i].qty,
        productTitle: req.body.items[i].title,
        // ...{
        //   productTotal: req.body.couponID ?
        //     Coupon.perCal(
        //       req.body.items[i].qty * req.body.items[i].price,
        //       req.body.shipping_discount
        //     ) : req.body.items[i].qty * req.body.items[i].price,
        // },
        // ...(req.body.couponID && {
        //   shipping_discount: `${req.body.shipping_discount}`,
        // })
      });

      let orderDetailsResult = await orderDetails.save();
      orderDetailsIds.push(orderDetailsResult.id);
    }
    res.send({
      "data": orderDetailsIds
    })
  } catch (error) {
    console.log(error);
  }


  newOrder.save(function (err, doc) {

  })
}

