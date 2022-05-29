let mongoose = require('mongoose');
let twoStepSMS = require('../models/2-Step-phone.model');
let User = require('../models/user.model');
let TempUser = require('../models/tempUser.model');
let { httpStatusCodes, errorMessage } = require('../core/constants');
let { otpGen } = require('../helper/otp');
let { userLogInOtpSend } = require('../helper/sms');
let { userJWT } = require('../helper/jwt');
let apiError = require("../core/apiError");

exports.phNoCheck = (req, res, next) => {
  User.findOne({
    'phone': req.params.phone
  }, (err, doc) => {
    if (err) {
      next(err);
    } else {
      res.status(httpStatusCodes.HTTP_SUCCESS).json({
        data: {
          available: doc ? true : false
        }
      });
    }
  })
}

exports.userRegister = (req, res, next) => {
  User.findOne({
    phone: req.body.phone
  },
    function (err, user) {
      if (err) {
        next(err);
      }
      if (user) {
        res.status(httpStatusCodes.CONFLICT).json({
          'error': 'Duplicate user.',
        });
      } else {
        const NewUser = new TempUser({
          'name': req.body.name,
          'phone': req.body.phone,
        });

        NewUser.save(function (err, doc) {
          if (err) {
            next(err);
          } else {
            const tStSMS = new twoStepSMS({
              userID: doc._id,
              userType: 'user',
              token: otpGen(4),
            });
            tStSMS.save((err, otpDoc) => {
              if (err) {
                console.log(err);
              } else {
                userLogInOtpSend(`${doc.phone}`, otpDoc.token, (err, result) => {
                  if (err) {
                    next(err);
                  } else {
                    res.status(httpStatusCodes.HTTP_SUCCESS).json({
                      request_id: otpDoc._id,
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  )
}

//* User Register
exports.userRegisterOtpSubmit = (req, res, next) => {
  twoStepSMS.findById(req.body.request_id, (err, smSdoc) => {
    if (err) {
      next(err)
    } else if (req.body.code == smSdoc.token) {

      // console.log(t);
      TempUser.findByIdAndRemove(smSdoc.userID, (err, temUser) => {
        if (err) {
          next(err);
        } else if (temUser) {
          const newUser = new User({
            'name': temUser.name,
            'phone': temUser.phone,
            'device.device_id': req.body.fcm_token,
          });
          newUser.save((err, user) => {
            if (err) {
              next(err);
            } else {
              userJWT(user, (err, token) => {
                if (err) {
                  next(err);
                } else {
                  res.json({
                    'message': 'login',
                    'id': token,
                  });
                }
              });
            }
          });
        }
        else {
          next(new apiError(httpStatusCodes.NOT_FOUND, errorMessage.USER_NOT_FOUND));
        }
      });
    } else {
      next(new apiError(httpStatusCodes.BAD_REQUEST, errorMessage.PATTERN));
    }
  });
};

/**
 * *user login api for Otp gen^
 * @param {Object} req request Object.
 * @param {Object} res responce Object.
 */
exports.userLogIn = (req, res, next) => {
  User.findOne({
    'phone': req.body.phone
  }, (err, doc) => {
    if (err) {
      next(err);
    } else if (doc) {
      const otp = otpGen(4);
      const tStSMS = new twoStepSMS({
        userID: doc._id,
        userType: 'user',
        token: otp,
      });
      tStSMS.save((err, otpDoc) => {
        if (err) {
          next(err);
        } else {
          userLogInOtpSend(`${doc.phone}`, otp, (err, result) => {
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
};


/**
 * *user login api for Otp submit
 * @param {Object} req request Object.
 * @param {Object} res responce Object.
 */
exports.logInOtpSubmit = (req, res, next) => {
  twoStepSMS.findById(req.body.request_id, (err, doc) => {
    if (err) {
      next(err);
    } else if (req.body.code == doc.token) {
      User.findById(doc.userID).exec((err, user) => {
        if (err) {
          next(err);
        } else {
          userJWT(user, (err, token) => {
            res.status(httpStatusCodes.HTTP_SUCCESS).json({
              'message': 'login',
              'id': token,
            });
            //* save devise id(fcm token) to user db
            User.findByIdAndUpdate(doc.userID, {
              $set: {
                'device.device_id': req.body.fcm_token,
              },
            }, (err, fcmSave) => {
              if (err) {
                console.log(err);
              } else {
                console.log('user token update');
              }
            });//findByIdAndUpdate
          });
        }
      });
    } else {
      next(new apiError(httpStatusCodes.BAD_REQUEST, errorMessage.BAD_REQUEST));
    }
  })
};

exports.displayProfile = (req, res) => {
  res.status(httpStatusCodes.HTTP_SUCCESS).json({
    user: {
      name: req.user.name,
      phone: req.user.phone,
      image: req.user.image
    }
  });
};

exports.profileUpdate = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id, {
    ...(name && {
      name: `${name}`,
    }),
    ...(phone && {
      'phone': `${phone}`,
    })
  },
    (err, doc) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({
          data: doc
        });
      }
    }
  );
};

exports.addAddress = (req, res, next) => {
  let {
    fullName,
    addressLine1,
    addressLine2,
    zipCode,
    city,
    state,
    country,
    landmark,
    phone
  } = req.body;
  User.findByIdAndUpdate(req.user._id, {
    $push: {
      addresses: {
        fullName,
        addressLine1,
        addressLine2,
        zipCode,
        city,
        state,
        country,
        landmark,
        phone: phone || req.user.phone
      },
    },
  }, (err) => {
    if (err) {
      next(err);
    }
    else {
      User.findById(req.user._id, (err, result) => {
        if (err) {
          next(err);
        } else {
          const x = result.addresses.length - 1;
          res.status(httpStatusCodes.HTTP_SUCCESS).json({
            data: result.addresses[x]
          });
        }
      });
    }
  });
}


exports.editAddress = (req, res, next) => {
  let {
    address_line,
    zip_code,
    city,
    state,
    address_type,
    landmark,
    phone
  } = req.body;

  User.updateOne({
    'addresses._id': mongoose.Types.ObjectId(req.body.id),
  }, {
    $set: {
      'addresses.$.address_line': address_line,
      'addresses.$.zip_code': zip_code,
      'addresses.$.city': city,
      'addresses.$.state': state,
      'addresses.$.address_type': address_type,
      'addresses.$.landmark': landmark,
      'addresses.$.phone': phone
    },
  }, (err) => {
    if (err) {
      next(err);
    } else {
      res.status(httpStatusCodes.HTTP_SUCCESS).json({
        msg: "Update success"
      });
    }
  });
}

exports.deleteAddress = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, {
    $pull: {
      addresses: {
        _id: mongoose.Types.ObjectId(req.body.id),
      },
    },
  }, (err) => {
    if (err) {
      next(err);
    }
    else {
      res.status(httpStatusCodes.HTTP_SUCCESS).json({
        'msg': 'deleted',
        'id': req.body.id,
      });
    }
  });
};

//all address
exports.allAddress = (req, res) => {
  res.status(httpStatusCodes.HTTP_SUCCESS).json({
    'data': req.user.addresses,
  });
}