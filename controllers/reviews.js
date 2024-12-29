const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.newReview=async (req,res)=>{
    // You will get an error here, Cannot read properties of null (reading 'reviews')
    // This is coz req.params.id is null, as we don't have :id here, it's in app.js
    // This is annoying as express keeps it separate params for separate routers
    // To overcome this, in express.Router(), add the mergeParams:true
    // const router=express.Router({mergeParams:true})

    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    req.flash('success','Successfully made a new review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req,res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','Successfully deleted a review')
    res.redirect(`/campgrounds/${id}`)
 }