/* eslint-disable linebreak-style */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const twoStepSMS = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
    },
    userType: String,
    token: String,
}, {
    collection: 'twoStepSMS',
    timestamps: true,
});

module.exports = mongoose.model('twoStepSMS', twoStepSMS);
