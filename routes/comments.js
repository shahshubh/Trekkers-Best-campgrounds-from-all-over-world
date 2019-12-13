var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment")
//=============================
//COMMENTS ROUTES
//=============================

router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/campgrounds/:id/comments", isLoggedIn, function(req,res){
    //find campground using id
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");   
        }
        else{
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                }
                else{
                    //add username and id tocomment 
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added a comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });

        }
    });
    //create new comment
    //connect new comment to campground
    //redirect to campground show page
});


//EDIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});

        }
    });
});

//UPDATE ROUTE
router.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

//DISTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership,  function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success", "Comment Deleted");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    })
});


//MIDDLEWARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
} 

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        //does user own Comment
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            }
            else{
                //does user own Comment
                //cannot do === since foundComment.author.id is object and not a String
                if((foundComment.author.id).equals(req.user._id)){
                    next();
                //otherwise redirect
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