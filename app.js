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
const session = require('express-session')
const flash = require('connect-flash')

const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

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
    useUnifiedTopology: true,
    useFindAndModify: false
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
app.use(express.static(path.join(__dirname, 'public')))
const sessionConfig = {
    secret: 'thiscouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// FLASH
app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


////////////
// ROUTES //
////////////
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

// HOME ROUTE
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