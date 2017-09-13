var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var multer      =   require('multer');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.use(bodyParser.urlencoded({ extended: true }));

var storage =   multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/avatar');
  },
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var upload = multer({ storage : storage}).single('avatar');

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
// router.post("/register", function(req, res){
//      var firstName= req.body.firstName;
//      var lastName= req.body.lastName;
//      var email= req.body.email;
//      var dob = req.body.dob;
//      var avatar = req.body.avatar;
//      var username= req.body.username;
//      if(typeof req.file !== "undefined") {
//             avatar = '/uploads/' + req.file.filename;
//         } else {
//             avatar = '/uploads/no-image.png';
//         }
        
//     var newUser = new User({username: username, firstName:firstName,lastName:lastName, email:email, avatar:avatar, dob: dob});
//     User.register(newUser, req.body.password, function(err, user){
//         if(err){
//             req.flash("error", err.message);
//             return res.render("register");
//         }
//         passport.authenticate("local")(req, res, function(){
//           req.flash("success", "Welcome to YelpCamp " + user.firstName);
//           res.redirect("/campgrounds"); 
//         });
//     });
// });
router.post("/register", function(req, res){
    upload(req,res,function(err) {
        if(err) {
            return res.send("Error uploading file.");
        }
        var username = req.body.username;
        var firstName= req.body.firstName;
        var lastName= req.body.lastName;
        var email= req.body.email;
        var dob = req.body.dob;
        var about = req.body.about;
        var screenline = req.body.screenline;
        var avatar = req.body.avatar;
        if(typeof req.file !== "undefined") {
            var avatar = '/avatar/' + req.file.filename;
        } else {
            var avatar = '/avatar/no-image.png';
        }
        var newUser = new User({username: username, firstName:firstName,lastName:lastName, email:email, avatar:avatar, dob: dob, about:about, screenline:screenline});
        User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to WelComb " + user.username);
           res.redirect("/moments"); 
        });
    });
        
     });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/moments",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/moments");
});


// router.get("/users/:id", function(req, res) {
//   User.findById(req.params.id, function(err, foundUser) {
//     if(err) {
//       req.flash("error", "Something went wrong.");
//       res.redirect("/");
//     }
//     Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
//       if(err) {
//         req.flash("error", "Something went wrong.");
//         res.redirect("/");
//       }
//       res.render("users/show", {user: foundUser, campgrounds: campgrounds});
//     });
//   });
// });

router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      res.redirect("/");
    }
    Campground.find().where('author.id').equals(foundUser).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", "Something went wrong.");
        res.redirect("/");
      }
      res.render("users/show", {user: foundUser, campgrounds: campgrounds});
    });
  });
});

// router.get("/users/:id", function(req, res) {
//     User.findById(req.params.id, function(err, foundUser){
//         if (err) {
//             req.flash("error...","Something Went Wrong");
//             res.redirect("/");
//         } 
//             res.render("users/show", {user: foundUser});
        
//     })
// })



module.exports = router;