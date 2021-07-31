const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../utils/middleware')


////////////////////////
// CAMPGROUNDS ROUTES //
////////////////////////

router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    console.log(req.body.campground)
    await Campground.findByIdAndUpdate(id,
        { ...req.body.campground },
        { useFindAndModify: false })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Campground successfully deleted!')
    res.redirect(`/campgrounds`)
}))

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground', 400)
    const camp = await new Campground(req.body.campground)
    camp.author = req.user._id
    await camp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp.id}`)
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const camp = await (await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: { path: 'author' }
        })
        .populate('author'))
    if (!camp) {
        req.flash('error', 'Campground not found!')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}))

module.exports = router