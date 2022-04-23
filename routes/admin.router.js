const express = require('express');
const router = express.Router();
const AdminController = require('../controller/admin.controller');
const passport = require('passport');

router.post('/admin/login', AdminController.login);

router.post('/admin/login/otp', AdminController.otp);

router.get('/admin/category', passport.authenticate('adminJWT', { session: false }), AdminController.getCategory);

router.post('/admin/category', passport.authenticate('adminJWT', { session: false }), AdminController.addCategory);

router.get('/admin/product', passport.authenticate('adminJWT', { session: false }), AdminController.productList);

router.get('/admin/product/:id', passport.authenticate('adminJWT', { session: false }), AdminController.productDetails);

router.post('/admin/product', passport.authenticate('adminJWT', { session: false }), AdminController.productAdd);

router.patch('/admin/product', passport.authenticate('adminJWT', { session: false }), AdminController.productUpdate);

router.delete('/admin/product', passport.authenticate('adminJWT', { session: false }), AdminController.productDelete);

module.exports = router;