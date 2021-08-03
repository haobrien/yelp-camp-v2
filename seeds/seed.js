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
    for (let i = 0; i < 300; i++) {
        const rand1k = Math.floor(Math.random() * 1000)
        const price = Math.ceil(Math.random() * 20) + 10
        const camp = new Campground({
            author: '61080a51d734bd15e0f49204',
            title: `${pickItem(descriptors)} ${pickItem(places)}`,
            location: `${cities[rand1k].city}, ${cities[rand1k].state}`,
            geometry: {
                type: "Point", 
                coordinates: [
                    cities[rand1k].longitude,
                    cities[rand1k].latitude,
                ]
            },
            images: [
                // {
                //     url: "https://res.cloudinary.com/dyhg63zvk/image/upload/v1627929427/YelpCamp/i7tmcr4wewoh3kiwfp8c.jpg",
                //     filename: "YelpCamp/i7tmcr4wewoh3kiwfp8c"
                // },
                {
                    url: "https://res.cloudinary.com/dyhg63zvk/image/upload/v1627929429/YelpCamp/b6vgtukd1y784xm1s07d.jpg",
                    filename: "YelpCamp/b6vgtukd1y784xm1s07d"
                },
                {
                    url: "https://res.cloudinary.com/dyhg63zvk/image/upload/v1627929430/YelpCamp/evybgkjdjgea5vu2lwot.jpg",
                    filename: "YelpCamp/evybgkjdjgea5vu2lwot"
                }],
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