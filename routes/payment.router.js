/* eslint-disable new-cap */
// app cart route
const express = require('express');
const router = express.Router();
const passport = require('passport');
const payController = require('../controller/payment.controller'); // app caet controller

router.post('/pay/online',
  passport.authenticate('userJWT', { session: false }),
  payController.online);//!!

router.post('/pay/cod',
  passport.authenticate('userJWT', { session: false }),
  payController.cod);//!!

router.post('/pay/cancel', passport.authenticate('bearer', {
  session: false,
}), payController.cancel);

module.exports = router;
