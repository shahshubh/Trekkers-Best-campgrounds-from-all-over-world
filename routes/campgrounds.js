var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

router.get("/campgrounds",function(req,res){
    //get data from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index",{campgrounds: allCampgrounds});
        }
    });
});

//CREATE
router.post("/campgrounds", isLoggedIn, function(req,res){
    var name = req.body.name; 
    var desc = req.body.description; 
    var image = req.body.image;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author: author};
//req.user has INFO of CURRENTLY LOGGED IN USER

    //create new cmpground and save to db
    Campground.create(newCampground,  function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            console.log(newlyCreated);  
            res.redirect("/campgrounds");
        }
     });
});

router.get("/campgrounds/new", isLoggedIn, function(req,res){
    res.render("campgrounds/new");  
});

//Show- shows more info
router.get("/campgrounds/:id",function(req,res){
    //find the campground with the provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }
        else{
            //render show template with that campground
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });

});

//EDIT ROUTE
router.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req,res){  
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{                
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    }); 
});

//UPDATE ROUTE
router.put("/campgrounds/:id", checkCampgroundOwnership, function(req,res){
    //find and update
    Campground.findByIdAndUpdate(req.params.id, req.body.editedData, function(err,updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
    //redirect
});


//Destroy Route
router.delete("/campgrounds/:id", checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds");
        }
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
} 

function checkCampgroundOwnership(req, res, next){
    if(req.isAuthenticated()){
        //does user own campground
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            }
            else{
                //does user own campground
                if((foundCampground.author.id).equals(req.user._id)){
                    next();
                //therwiseo redirect
                }
                else{
                    req.flash("error", "Access Denied !!");
                    res.redirect("back");
                }
            }
        });
    }
    //redirect
    else{
        req.flash("error", "Please Login to do that");
        res.redirect("back");
    }
}

module.exports = router;