// app user route
const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controller/user.controller');

router.get('/user/check-phone-no/:phone', userController.phNoCheck);

router.post('/user/register', userController.userRegister);

router.post('/user/register/otp-submit', userController.userRegisterOtpSubmit);

router.post('/user/login', userController.userLogIn);

router.post('/user/login/otp-submit', userController.logInOtpSubmit);

router.get('/user/profile', passport.authenticate('userJWT', { session: false }), userController.displayProfile);

router.patch('/user/profile', passport.authenticate('userJWT', { session: false }), userController.profileUpdate);

router.post('/user/address', passport.authenticate('userJWT', { session: false }), userController.addAddress);

router.patch('/user/address', passport.authenticate('userJWT', { session: false }), userController.editAddress);

router.delete('/user/address', passport.authenticate('userJWT', { session: false }), userController.deleteAddress);

router.get('/user/address', passport.authenticate('userJWT', { session: false }), userController.allAddress);

module.exports = router;
