const User = require('../models/user');

module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register')
}

module.exports.registerUser= async (req,res)=>{
    // We are wrapping this in a separate try-catch, coz we don't want that ugle express-error screen
    // Idk what was the point for catchAsync now
    try{
        const {username, password,email}= req.body;
        // While creating the user, only pass in the username and email
        const user = await new User({username,email});
        // THEN, we use user.register to save the hashed password AND SAVE the user in our db
        const registeredUser = await User.register(user,password)
        console.log(registeredUser);

        // We do req.login() as when we register, we have to go back and login. That's dumb. So we use this
        // req.login() is called automatically when password.authenticate() runs
        req.login(registeredUser,(err)=>{
            if (err) return next(err);
            req.flash('success','Welcome to yelpCamp');
            res.redirect('/campgrounds')    
        })
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
}

module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login')
}

module.exports.loginUser = (req,res)=>{
    req.flash('success',`Welcome Back, ${req.body.username}`);
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req,res)=>{
    // req.logout(callback) will log the user out. Slayy
    req.logout(function(err){
        if (err){
            return next(err);
        }
        req.flash('success','Successfully logged out');
        res.redirect('/campgrounds')
    })
}