const express=require('express');
const router=express.Router({mergeParams:true})

const Campground = require('../models/campground')
const Review = require('../models/review')

const reviewsController = require('../controllers/reviews')

const catchAsync = require('../utils/catchAsync')
const {validateReview, isLoggedIn, isReviewAuthor}=require('../middleware')

// Adding reviews
router.post('/',isLoggedIn, validateReview,reviewsController.newReview)

// Deleting reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewsController.deleteReview))

 module.exports=router
