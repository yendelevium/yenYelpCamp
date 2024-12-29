// THESE SCHEMAS ARE NOT MONGOOSE SCHEMAS, THEY HAVE NOTHING TO DO WITH THEM EITHER
// THEY ARE JUST A THING

const Joi = require('joi')
// Joi is used for server-side validation
// Currently, u can't send invalid data through our form (except like price can be -ve or sm shit)
// But u CAN send via postman. So this validation is for that (and also the price thingy)
module.exports.campgroundSchema = Joi.object({
    // So if u forgot, our req.body, is an object called campground, which has the stuff. Remember campground[title] in the form?
    // So, ur campgroundSchema, WHICH IS NOT A MONGOOSE SCHEMA, is a Joi.object(), and also the campground object in it is also a Joi.object(), that's required.
    // Ur validations are <type>.validations()
    campground : Joi.object({
        title : Joi.string().required(),
        // image : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        price : Joi.number().required().min(0) //setting min(0) as price can't be -ve
    }).required(),
    deleteImages : Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating : Joi.number().min(1).max(5).required(),
        body: Joi.string().required()
    }).required()
})