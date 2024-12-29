const mongoose=require('mongoose');
const { campgroundSchema } = require('../schemas');
const Review = require("./review")
// Just for a short hand, as we will be using mongoose.Schema a lot
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200,h_200')
})

const CampgroundSchema = new Schema({
    title:String,
    images : [ImageSchema],
    price: Number,
    description : String,
    location : String,

    // Adding the Author of the campground
    author : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews :[
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
})

// Deleting all reviews frm Reviews if we delete campground
CampgroundSchema.post('findOneAndDelete', async (campground)=>{
    // If campground exists
    if (campground){
        await Review.deleteMany({
            _id : {$in : campground.reviews}
        });
    }
})

module.exports=mongoose.model('Campground', CampgroundSchema)   