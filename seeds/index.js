// We will run this file kindof standalone whenever we wanna seed our data 
// We will first delete all existing seeds and then add the new ones

const mongoose=require('mongoose')
const Campground = require('../models/campground')
const Review = require('../models/review')
const cities = require('./cities')
const {places, descriptors}=require('./seedHelpers')
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
    .then(()=>{
        console.log("Connection Open")
    })
    .catch(err=>{
        console.log("Connection Failed");
        console.log(err);
    })

// A function to randomly get some array index
const randomSample = array => array[Math.floor(Math.random()*array.length)]

// Making the function to delete the existing seeds and then adding the new seeds
const seedDB = async()=>{
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for(let i =0; i<50;i++){
        const random1000 = Math.floor(Math.random()*1000) //A random no b/w 1 to 1000 as we hv 1000 cities in the file
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'67585fc968301084619685a3',
            title: `${randomSample(descriptors)} ${randomSample(places)}`,
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odit, molestias! Iure eos nam natus. Ipsam culpa, officiis totam laboriosam ex animi amet excepturi, quo assumenda id commodi. Ipsam, perspiciatis unde.',
            price,
            images:[
                {
                  url: 'https://res.cloudinary.com/dleckuafs/image/upload/v1735410675/yelpCamp/x0hzceytdn7xetqfsokv.jpg',
                  filename: 'yelpCamp/x0hzceytdn7xetqfsokv',
                },
                {
                  url: 'https://res.cloudinary.com/dleckuafs/image/upload/v1735410675/yelpCamp/kgklxxormybxxanisklg.jpg',
                  filename: 'yelpCamp/kgklxxormybxxanisklg',
                }
            ]
        })
        await camp.save()
    }
}

// After finishing the function, close the db connection
seedDB().then(()=>{
    mongoose.connection.close()
})