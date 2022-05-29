const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  name: String,
  image: {
    type: String,
    default: '/public/assets/images/profile-main.jpg',
  },
  phone: {
    type: Number,
    index: true,
    unique: true, // Unique index. If you specify `unique: true`
    // specifying `index: true` is optional if you do `unique: true`
  },
  type: {
    type: String,
    default: 'user',
  },
  addresses: [{
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    zipCode: Number,
    city: String,
    state: String,
    country: String,
    landmark: String,
    phone: Number,
    primary:{
      type:Boolean,
      default:false
    }
  }],
  device: {
    device_id: String,
    device_type: String, // android/apple
  },
}, {
  collection: 'users',
  timestamps: true,
});

module.exports = mongoose.model('users', UsersSchema);
