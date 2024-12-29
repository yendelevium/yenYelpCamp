// Only if we are in development mode, then require the .env file
// In production, we don't store env variables in a .env file, we have a diff way to store the variables, we will see that when we get there
if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express')
const mongoose=require('mongoose')
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const MongoStore = require('connect-mongo'); //So that the sessions are stored in mongo and NOT in memory

const User = require('./models/user');

const ExpressError = require('./utils/ExpressError')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

// TO prevent SQL Injection
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet')

const dbURL = process.env.DB_URL
// 'mongodb://127.0.0.1:27017/yelpCamp'
mongoose.connect(dbURL)
    .then(()=>{
        console.log("Connection Open")
    })
    .catch(err=>{
        console.log("Connection Failed");
        console.log(err);
    })

const app= express()

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());
app.use(
    helmet({
      contentSecurityPolicy: false,
      xDownloadOptions: false,
    })
);

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function(err){
    console.log("SESSION STORE ERROR",err)
})

const sessionConfig={
    store,
    secret: "ThisIsASecret",
    resave:false,
    saveUninitialized:true,
    // Adding options for the session cookie
    cookie: {
        // For security, so that u can't access our cookies vis XSS Javascript
        httpOnly:true,
        // secure:true, This makes it so we can only access the site via https, use this while deploying NOT IN LOCALHOST
        // Date.Now() is in MILLISECONDS, So we want it to expire after a week, so we do some math
        expires:Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

// This is required to start up passport, make sure u use express-session before passport.session()
// This is so that the passport middleware (made by initialize) can use the passport session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())) // This tells password to use the local strategy on User schema for authentication(provided by p-l-m)
// You can use multiple strategies on the same schema, no worries

// This is a way for passport to store user in a session and remove it frm the session. The methods on User was given by passport-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use("/",userRoutes)
app.use("/campgrounds",campgroundRoutes)
app.use("/campgrounds/:id/reviews",reviewRoutes)

app.get("/",(req,res)=>{
    res.render('home')
})

// Making the 404 response. Write this AFTER all ur routes, the order is very impo as it's like a safety net if none of the other routes match
app.all('*', (req,res,next)=>{
    next(new ExpressError("Page Not Found",404))
})

app.use((err,req,res,next)=>{
    const { statusCode=500 }=err
    if(!err.message){
        err.message="Oh no, Something went wrong"
    }
    res.status(statusCode).render('error',{err})
})

app.listen(8080, ()=>{
    console.log("Serving on port 8080")
})