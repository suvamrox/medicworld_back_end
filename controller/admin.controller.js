let mongoose = require('mongoose');
let ProductModel = require('../models/product.model');
let CategoryModel = require('../models/category.model');
let twoStepSMS = require('../models/2-Step-phone.model');
let AdminModel = require('../models/admin.model');
let { httpStatusCodes, errorMessage, filePath } = require('../core/constants');
let { otpGen } = require('../helper/otp');
let { userLogInOtpSend } = require('../helper/sms');
let { adminJWT } = require('../helper/jwt');
let apiError = require("../core/apiError");
let appRoot = require('app-root-path');
let { uploadImages } = require('../helper/file');

exports.login = (req, res, next) => {
    AdminModel.findOne({
        'phone': req.body.phone
    }, (err, doc) => {
        if (err) {
            next(err);
        } else if (doc) {
            const otp = otpGen(4);
            const tStSMS = new twoStepSMS({
                userID: doc._id,
                userType: 'admin',
                token: otp,
            });
            tStSMS.save((err, otpDoc) => {
                if (err) {
                    next(err);
                } else {
                    userLogInOtpSend(`${doc.phone}`, otp, (err) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(httpStatusCodes.HTTP_SUCCESS).json({
                                request_id: otpDoc._id,
                            });
                        }
                    });
                }
            })
        } else {
            next(new apiError(httpStatusCodes.NOT_FOUND, errorMessage.USER_NOT_FOUND));
        }
    });
}

exports.otp = (req, res, next) => {
    twoStepSMS.findById(req.body.request_id, (err, doc) => {
        if (err) {
            next(err);
        } else if (req.body.token == doc.token) {
            AdminModel.findById(doc.userID).exec((err, user) => {
                if (err) {
                    next(err);
                } else {
                    adminJWT(user, (err, token) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(httpStatusCodes.HTTP_SUCCESS).json({
                                'message': 'login',
                                'jwt_token': token,
                            });
                        }
                    });
                    AdminModel.findByIdAndUpdate(user._id, {
                        $set: {
                            'device.device_id': req.body.fcm
                        }
                    }).exec((err) => {
                        if (err) {
                            console.log("np fcm update");
                        } else {
                            console.log("admin fcm token update for admin");
                        }
                    })
                }
            });
        } else {
            next(new apiError(httpStatusCodes.BAD_REQUEST, errorMessage.BAD_REQUEST));
        }
    })
}

exports.getCategory = (req, res, next) => {
    CategoryModel.find({}).exec((err, doc) => {
        if (err) next(err)
        else { }
        res.status(httpStatusCodes.HTTP_SUCCESS).json(doc);
    });
}


exports.addCategory = (req, res, next) => {
    let { title, forHomePageOnly } = req.body;
    let newCategory = new CategoryModel({
        title,
        forHomePageOnly
    });

    newCategory.save((err, doc) => {
        if (err) next(err)
        else {
            res.status(httpStatusCodes.HTTP_SUCCESS).json(doc);
        }
    });
}


exports.productList = (req, res, next) => {

}

exports.productDetails = (req, res, next) => {

}

exports.productAdd = (req, res, next) => {

    const newProduct = new ProductModel({
        title: req.body.title,
        tagLine: req.body.tagLine, // for short setails
        description: req.body.description, // details
        actualPrice: req.body.actualPrice, // $15
        discountPercentage: req.body?.discountPercentage,
        sellingPrice: req.body.sellingPrice,
        status: true,
        avlStatus: true,
        avlQty: req.body?.avlQty,
        categories: req.body.categories
    }).save((err, p) => {
        if (err) console.log(err);
        else {
            uploadImages(`${appRoot}/${filePath.product_image_hdd_path}/${p.id}`, req.body.images, (filesName) => {
                ProductModel.findByIdAndUpdate(p.id, {
                    $set: {
                        image: filesName
                    }
                }, (err, doc) => {
                    if (err) next(err);
                    res.send(doc);
                })
            });
        }
    });
}

exports.productUpdate = (req, res, next) => {

}

exports.productDelete = (req, res, next) => {

}