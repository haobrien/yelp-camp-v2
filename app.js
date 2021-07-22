// YELPCAMP HOME PAGE
const express = require('express')
const app = express()
const path = require('path')
const Campground = require('./models/campground')
const Review = require('./models/review')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const morgan = require('morgan')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas.js')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)



//////////////
// DATABASE //
//////////////

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})



////////////////////////
// EXPRESS MIDDLEWARE //
////////////////////////
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(morgan('tiny'))

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}



////////////
// ROUTES //
////////////

app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    console.log(req.body.campground)
    await Campground.findByIdAndUpdate(id,
        { ...req.body.campground },
        { useFindAndModify: false })
    res.redirect(`/campgrounds/${id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect(`/campgrounds`)
}))

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground', 400)

    const camp = await new Campground(req.body.campground)
    await camp.save()
    res.redirect(`/campgrounds/${camp.id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const camp = await Campground.findById(id).populate('reviews')
    res.render('campgrounds/show', { camp })
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    camp.reviews.push(review)
    await review.save()
    await camp.save()
    res.redirect(`/campgrounds/${camp.id}`)
}))

app.delete('/campgrounds/:campId/reviews/:reviewId', catchAsync(async (req, res) => {
    const { campId, reviewId } = req.params
    await Review.findByIdAndDelete(reviewId)
    await Campground.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } })
    res.redirect(`/campgrounds/${campId}`)
}))

app.get('/', (req, res) => {
    res.render('home')
    // throw new Error('UH OH!')
})



///////////////
// CATCH ALL //
///////////////

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})



///////////////////
// ERROR HANDLER //
///////////////////

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong...' } = err
    if (!err.message) err.message = 'Uh oh... something went wrong!'
    console.log('@@@@@ ERROR @@@@@')
    res.status(statusCode).render('error', { err })
})



//////////////////
// SERVER START //
//////////////////

app.listen(3000, () => {
    console.log('Serving on port 3000')
})