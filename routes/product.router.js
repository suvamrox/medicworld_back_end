/* eslint-disable new-cap */
// app cart route
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ProductController = require('../controller/product.controller');

router.get('/category/listWithIcon', ProductController.homePageCategoriesWithIcons);

router.get('/banners/homePage', ProductController.homePageBanner);

router.get('/category/homePage', ProductController.homeCategories);

router.get('/category/:cid/products', ProductController.productByCategories);

module.exports = router;
