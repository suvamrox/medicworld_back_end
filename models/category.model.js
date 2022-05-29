const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let category = new Schema({
    icon: {
        type:String,
        default:'thumbnail.png'
    },
    title: String,
    forHomePageOnly: Boolean,
    status:{
        type:Boolean,
        default: false
    },
}, {
    collection: "category",
    timestamps: true
})

module.exports = mongoose.model("category", category);