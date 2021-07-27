const express = require('express')
const router = express.Router()

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const { campgroundSchema, reviewSchema } = require('../schemas.js')


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


////////////////////////
// CAMPGROUNDS ROUTES //
////////////////////////

router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    console.log(req.body.campground)
    await Campground.findByIdAndUpdate(id,
        { ...req.body.campground },
        { useFindAndModify: false })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id', catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Campground successfully deleted!')
    res.redirect(`/campgrounds`)
}))

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground', 400)
    const camp = await new Campground(req.body.campground)
    await camp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp.id}`)
}))

router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const camp = await Campground.findById(id).populate('reviews')
    if (!camp) {
        req.flash('error', 'Campground not found!')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}))

module.exports = router