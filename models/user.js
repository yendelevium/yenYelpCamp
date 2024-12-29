const mongoose = require('mongoose')
const Schema=mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

// While defining the userSchema, we don't define usernm and password
const UserSchema = Schema({
    email :{
        type : String,
        required : true,
        unique : true
    }
})

// This line adds the username, hash and salt, and the hashedpw to our userSchema
// It also adds additional methods to the userSchema
// Read the docs for passport-local-mongoose
// This doesn't use bcrypt as its hashing algo, instead uses PBKDF2
UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User',UserSchema);