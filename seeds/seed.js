// SEED DATABASE
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedNamer')

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

const pickItem = array => {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const rand1k = Math.floor(Math.random() * 1000)
        const price = Math.ceil(Math.random() * 20) + 10
        const camp = new Campground({
            author: '61033babb625b22b5cbe8274',
            title: `${pickItem(descriptors)} ${pickItem(places)}`,
            location: `${cities[rand1k].city}, ${cities[rand1k].state}`,
            image: 'https://source.unsplash.com/1600x900/?camping',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae nulla sunt dolorum reiciendis quas, autem illum! Expedita animi, amet praesentium itaque tempore quis, accusamus magnam iusto, error dicta illum alias',
            price
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
    console.log('Database seed successful. Connection closed.')
}).catch(e => {
    console.log('Seed failed')
})