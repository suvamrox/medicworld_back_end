const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let admin = new Schema({
    phone: {
        type: Number,
        index: true,
        unique: true, // Unique index. If you specify `unique: true`
        // specifying `index: true` is optional if you do `unique: true`
    },
    type: {
        type: String,
        default: "admin"
    },
    device: {
        device_id: String,
        device_type: String, // android/apple
    },
}, {
    collection: "admin",
    timestamps: true
});

module.exports = mongoose.model("admin", admin);