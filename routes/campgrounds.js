var express     =   require("express");
var multer      =   require('multer');
var router      =   express.Router();
var Campground  =   require("../models/campground");
var middleware  =   require("../middleware/index.js");
var Comment     = require("../models/comment");


var storage =   multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var upload = multer({ storage : storage}).single('image');

//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("moments/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("moments/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
     upload(req,res,function(err) {
        if(err) {
            return res.send("Error uploading file.");
        }
        //get data from form and add to campgrounds array
        var name = req.body.name;
        if(typeof req.file !== "undefined") {
            var image = '/uploads/' + req.file.filename;
        } else {
            var image = '/uploads/no-image.png';
        }
        var desc = req.body.description;
        var place = req.body.place;
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        var newCampground = {name: name, image: image, description: desc, place:place, author: author};
        //Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else{
                //redirect back to campgrounds page
                res.redirect("/moments");       
            }
        });
     });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("moments/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate("ratings").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            if(foundCampground.ratings.length > 0) {
              var ratings = [];
              var length = foundCampground.ratings.length;
              foundCampground.ratings.forEach(function(rating) { 
                ratings.push(rating.rating) 
              });
              var rating = ratings.reduce(function(total, element) {
                return total + element;
              });
              foundCampground.rating = rating / length;
              foundCampground.save();
            }
            console.log("Ratings:", foundCampground.ratings);
            console.log("Rating:", foundCampground.rating);
            //render show template with that campground
            res.render("moments/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("moments/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.send("Error uploading file.");
        }
        if(req.body.removeImage) {
            req.body.campground.image = '/uploads/no-image.png';
        }
        else if(req.file) {
            req.body.campground.image = '/uploads/' + req.file.filename;
        }
        //find and update the correct campground
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err){
                res.redirect("/moments");
            } else {
                res.redirect("/moments/" + req.params.id);
            }
        });
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/moments");
      } else {
          res.redirect("/moments");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

