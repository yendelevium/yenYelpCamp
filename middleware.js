const {campgroundSchema} = require("./schemas")
const {reviewSchema} = require("./schemas")

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')

const Campground = require('./models/campground')
const Review = require('./models/review')

// This middleware will be used whenever we need the user to be logged in to do something, like creating/editing a campground etc
module.exports.isLoggedIn=(req,res,next)=>{
    // To check if the person is logged in, passport has the isAuthenticated() method on the req body
    // So we don't need to manually set sessions anol like we did while learning auth, passport does it for u (using serializeUser and deserializeUser we used in app.js)
    console.log(req.user); // This has the details of the currentUser who is logged in (undefined if not logged in)
    // console.log(req.path,req.originalUrl);

    // This lil code is to redirect the user back to the page they were trying to access when they weren't logged in 
    // We save this in the session
    // But passport clears the session if u login again (ie, passport.authenticate() clears the previous session when it's called)
    // So we have another middleware that will store this to res.locals (which can be accessed by templated AND ALL Middleware)
    // We call this middleware before password.authenticate(), very slay
    req.session.returnTo=req.originalUrl
    if (!req.isAuthenticated()){
        req.flash('error','You must be logged in.');
        return res.redirect('/login')
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// Creating a middleware to validate the req.body
module.exports.validateCampground = (req,res,next)=>{
    // console.log(campgroundSchema.validate(req.body))
    const {error}=campgroundSchema.validate(req.body) //We wanna validate req.body since that's where the form data will be stored
    // We are extracting the error.
    if (error){
        const msg = error.details.map(err => err.message).join(',') //Am just iterating through all errors, and joining their messaged with a ,
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

// Checking if ur the author of the campground, so u can be allowed to do sm shit
module.exports.isAuthor = catchAsync(async (req,res,next)=>{
    const {id}=req.params
    const campground = await Campground.findById(id);
    if (!campground){
        req.flash("error","Cannot find campground");
        // Have to return it so it doesn't render more than one page, u will get error if that happens
        return res.redirect("/campgrounds")
    }
    if (!campground.author.equals(req.user._id)){
        req.flash('error','You lack permissions to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
})

module.exports.validateReview = (req,res,next)=>{
    const {error}=reviewSchema.validate(req.body) //We wanna validate req.body since that's where the form data will be stored
    // We are extracting the error.
    if (error){
        const msg = error.details.map(err => err.message).join(',') //Am just iterating through all errors, and joining their messaged with a ,
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

module.exports.isReviewAuthor = catchAsync(async (req,res,next)=>{
    const {id, reviewId}=req.params
    console.log(reviewId)
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        req.flash('error','You lack permissions to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
})