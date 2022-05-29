const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  title: String,
  tagLine: String, // for short setails
  tagLine: String, // for short setails
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'category',
    required: true,
  }], // breakfast,lunch, dinner
  description: String, // details
  actualPrice: Number, // $15
  discountPercentage: Number, //5%
  sellingPrice: Number, // $15
  images: [String], // for food image
  // !admin only control this
  status: {
    type: Boolean, // 0->deactive ,1->active
    default: 1,
  },
  // *seller and admin can control this
  avlStatus: {
    type: Boolean, // 0->deactive ,1->active
    default: 1,
  },
  avlQty: Number
}, {
  collection: 'products',
  timestamps: true,
});

ProductsSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model('products', ProductsSchema);
