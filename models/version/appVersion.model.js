const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appVersionSchema = new Schema({
    name: String,
    platform: String,
    versionNumber: Number
}, {
    collection: 'appVersion',
    timestamps: true,
});

module.exports = mongoose.model('appVersion', appVersionSchema);