// CAMPGROUND MODEL
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: {virtuals: true } }

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popupText').get(function () {
    return `<div class="text-center"><p><a class="fw-bold" href='/campgrounds/${this.id}'>${this.title}</a><br/><span class="text-muted">${this.location}</span></p></div>`
})

// deletes any post related to deleted camp
CampgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({
            _id: { $in: camp.reviews }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)