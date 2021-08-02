const Campground = require('../models/campground')

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params
    console.log(req.body.campground)
    await Campground.findByIdAndUpdate(id,
        { ...req.body.campground },
        { useFindAndModify: false })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.renderEditForm = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground', 400)
    const camp = await new Campground(req.body.campground)
    camp.author = req.user._id
    await camp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp.id}`)
}

module.exports.showCampground = async (req, res, next) => {
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
}

module.exports.deleteCampground = async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Campground successfully deleted!')
    res.redirect(`/campgrounds`)
}