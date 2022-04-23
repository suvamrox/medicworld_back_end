const order = require('../models/order.model');
const OrderDetails = require('../models/orderDetails.model');
const mongoose = require('mongoose');

exports.online = (req, res, next) => {

}

exports.cod = async (req, res, next) => {
    console.log(req.body);
    const orderDetailsIds = [];
    try {
        const newOrder = new order({
            'customerID': req.user._id,
            'paymentDetails.pamentType': req.body.payment.type,
            'paymentDetails.pamentJsone': JSON.stringify(req.body.payment),
            'shipperID': req.body.shipperID,
            'saleTex': req.body.saleTex,
            'deliveryFee': req.body.deliveryFee,
            'address': req.body.address,
            'subtotal': Number(req.body.subtotal),
            'totalPrice': Number(req.body.totalPrice),
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
                // supplierID: req.body.items[i]?.supplierId,
                productPrice: req.body.items[i].productPrice,
                productQty: req.body.items[i].productQty,
                productTitle: req.body.items[i].productTitle,
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

        order.findByIdAndUpdate(
            newOrderResult._id, {
            $set: {
                orderDetails: orderDetailsIds,
            },
        },
            (err) => {
                if (err) {
                    next(err)
                } else {
                    res.send({
                        "data": newOrderResult
                    });
                }
            }
        );

    } catch (error) {
        console.log(error);
        next(error);
    }
}

exports.cancel = (req, res, next) => {

}