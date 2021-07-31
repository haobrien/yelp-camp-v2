const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model("Review", reviewSchema)