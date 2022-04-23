const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempUsersSchema = new Schema({
  name: {
    type: String,
    required: true,
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
}, {
  collection: 'Tempusers',
  timestamps: true,
});

module.exports = mongoose.model('Tempusers', TempUsersSchema);
