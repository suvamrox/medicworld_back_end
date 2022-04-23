const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let coupon = new Schema({
    supplierID: {
        type: Schema.Types.ObjectId
    },
    couponCode: String,
    percentage: Number,
    priceRange: [{
        upperLimit: Number,
        price: Number
    }],
    qty: Number
}, {
    collection: "coupon",
    timestamps: true
})

module.exports = mongoose.model("coupon", coupon);