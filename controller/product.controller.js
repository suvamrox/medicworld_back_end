const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');
let { httpStatusCodes, errorMessage, filePath } = require('../core/constants');

exports.homePageCategoriesWithIcons = (req, res, next) => {
    CategoryModel.find({
        forHomePageOnly: false
    }).exec((err, doc) => {
        if (err)
            next(err);
        else
            res.status(httpStatusCodes.HTTP_SUCCESS).json(doc);
    });
}

exports.homePageBanner = (req, res, next) => {
    res.status(httpStatusCodes.HTTP_SUCCESS).send(['banner0.png', 'banner1.png', 'banner2.png']);
}

exports.homeCategories = (req, res, next) => {
    CategoryModel.find({
        forHomePageOnly: true
    }).exec((err, doc) => {
        if (err)
            next(err);
        else
            res.status(httpStatusCodes.HTTP_SUCCESS).json(doc);
    });
}

exports.productByCategories = (req, res, next) => {
    const perPage = Number(req.query.limit) || 10; //10docs in single page
    const page = (Number(req.query.page_no) - 1) || 0; //1st page
    ProductModel.find({ categories: req.params.cid }).skip(perPage * page).limit(perPage).exec((err, docs) => {
        if (err) next(err);
        else res.status(httpStatusCodes.HTTP_SUCCESS).json(docs);
    });
}


