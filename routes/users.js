const express = require('express');
const router=express.Router()
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const usersController=require('../controllers/users')

const {storeReturnTo} = require('../middleware')


router.route('/register')
    .get(usersController.renderRegisterForm) // The register form
    .post(catchAsync(usersController.registerUser)) // This just registers a user, IT DOESN'T LOG THEM IN



router.route('/login')
    .get(usersController.renderLoginForm) // Render login form

    // So, this middleware, passport.authenticate('local'), will authenticate u automatically, based on the 'local' strategy
    // You can pass additional options, like failureFlash : true which will send a flash automatically, and failureRedirect to '/login',
    // So on failure on authentication, it will redirect to /login
    // If everything is successful, then the callback (req,res) is executed

    // Testing : username- yendelevium, pw: Mendelevium1#
    // To login the user
    .post(storeReturnTo, passport.authenticate('local',{failureFlash:true, failureRedirect:'/login'}), usersController.loginUser)

// To logout the user
router.get('/logout', usersController.logoutUser)

module.exports = router