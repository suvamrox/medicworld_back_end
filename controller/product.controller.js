const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');
let { httpStatusCodes, errorMessage, filePath } = require('../core/constants');

exports.homePageBanner = (req, res, next) => {

}

exports.homeCategories = (req, res, next) => {
    CategoryModel.find({
        forHomePageOnly: true
    }).exec((err, doc) => {
        if (err)
            next(err);
        else
            res.status(httpStatusCodes.HTTP_SUCCESS).json(doc);
    })
}

exports.productByCategories = (req, res, next) => {
    const perPage = Number(req.query.limit) || 10; //10docs in single page
    const page = (Number(req.query.page_no) - 1) || 0; //1st page
    ProductModel.find({ categories: req.params.cid }).skip(perPage * page).limit(perPage).exec((err, docs) => {
        if (err) next(err);
        else res.status(httpStatusCodes.HTTP_SUCCESS).json(docs);
    });
}


