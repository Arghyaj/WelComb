var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    createdAt: { type: Date, default: Date.now },
    screenline:String,
    about: String,
    firstName: String,
    lastName: String,
    email: String,
    dob: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);