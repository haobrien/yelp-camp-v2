const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapboxToken })

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
    const camp = await Campground.findByIdAndUpdate(id,
        { ...req.body.campground },
        { useFindAndModify: false })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.images.push(...imgs)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await camp.save()
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.renderEditForm = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // console.log(geoData.body.features[0].geometry)
    const camp = await new Campground(req.body.campground)
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.author = req.user._id
    camp.geometry = geoData.body.features[0].geometry
    await camp.save()
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${camp.id}`)
    // res.send('done!')
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