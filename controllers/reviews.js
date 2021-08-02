const Campground = require('../models/campground')
const Review = require('../models/review')


module.exports.createReview = async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    camp.reviews.push(review)
    await review.save()
    await camp.save()
    req.flash('success', 'Review added!')
    res.redirect(`/campgrounds/${camp.id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Review.findByIdAndDelete(reviewId)
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}