const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let category = new Schema({
    icon: String,
    title: String,
    forHomePageOnly: Boolean
}, {
    collection: "category",
    timestamps: true
})

module.exports = mongoose.model("category", category);