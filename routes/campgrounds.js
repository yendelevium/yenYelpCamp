const express=require('express');
const router=express.Router()

const Campground = require('../models/campground')

const catchAsync = require('../utils/catchAsync')

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')

const campgroundsController = require('../controllers/campgrounds')

const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

router.route('/')
    .get(catchAsync(campgroundsController.index)) // All campgrounds
    // Creating the new campground (post req)
    // If the route is getting too long u can indent like this if u want.

    .post(
        isLoggedIn, 
        upload.array('image'),
        validateCampground,
        catchAsync(campgroundsController.createNewCampground)
    )

// Form to create new campground
// Again, the order of ur routes matter, if u put /new AFTER /:id, it wont work cos 'new' will be taken as an id
router.get("/new",isLoggedIn, campgroundsController.renderNewForm)

router.route("/:id")
    .get(catchAsync(campgroundsController.showCampground)) // Show page fr campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground ,catchAsync(campgroundsController.editCampground))  // Editing the new campground(put req)
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundsController.deleteCampground)) // Delete campground

// Form to edit campground
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgroundsController.renderEditForm))

module.exports=router