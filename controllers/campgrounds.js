const { cloudinary } = require('../cloudinary')
const Campground = require('../models/campground')

// Its ur choice if u wanna add catchAsync here, or leave it in the routes
module.exports.index=async (req,res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new')
}

module.exports.showCampground = async (req,res)=>{
    const { id }=req.params
    const campground = await Campground.findById(id).populate({ 
        // This is a nested populate, where we need to populate reviews first, and then populate author in the reviews
        // This can be shitty to scale, coz double population for thousands or reviews SUCK, so it depends on what u wanna do with this
        // Sometimes it's ok if u just have the usernm instead of the wholeass user object
        path:'reviews',
        populate: {
            path:'author'
        }
    }).populate('author')
    // console.log(campground)
    if (!campground){
        req.flash("error","Cannot find campground");
        // Have to return it so it doesn't render more than one page, u will get error if that happens
        return res.redirect("/campgrounds")
    }
    res.render('campgrounds/show',{campground})
}

module.exports.createNewCampground = async (req,res)=>{
    const campground=new Campground(req.body.campground);
    // Uploading the files we get from multer
    campground.images=req.files.map(f=>({
        url:f.path,
        filename:f.filename
    }))
    // console.log(req.files)
    // console.log(campground.images)
    campground.author= req.user._id;
    await campground.save();

    req.flash('success','Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderEditForm = async(req,res)=>{
    const { id }=req.params
    const campground = await Campground.findById(id)
    if (!campground){
        req.flash("error","Cannot find campground");
        return res.redirect("/campgrounds")
    }
    res.render('campgrounds/edit',{campground})
}

module.exports.editCampground = async (req,res)=>{
    // The data sent by the form is in req.body.campground
    // We spreading it into the update function
    const { id }=req.params
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs = req.files.map(f=>({
        url:f.path,
        filename:f.filename
    }))
    campground.images.push(...imgs)
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        // Delete all images frm the db
        await campground.updateOne({$pull: { images:{ filename:{$in: req.body.deleteImages}}}})
    }
    await campground.save() 
    if (!campground){
        req.flash("error","Cannot find campground");
        return res.redirect("/campgrounds")
    }
    req.flash('success','Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

// In RubyOnRails, this is usually called destroy, not delete
// Over there the conventions are a bit stricter, but u can chill here do whtv u want
module.exports.deleteCampground= async (req,res)=>{
    const { id }=req.params
    const campground = await Campground.findByIdAndDelete(id)
    if (!campground){
        req.flash("error","Cannot find campground");
        return res.redirect("/campgrounds")
    }
    req.flash('success','Successfully deleted campground')
    res.redirect('/campgrounds')
}

