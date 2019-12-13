var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    Campground              = require("./models/campground"),
    Comment                 = require("./models/comment"),
    seedDB                  = require("./seeds"),
    passport                = require("passport"),
    LocalStrategy           = require("passport-local"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    User                    = require("./models/user"),
    methodOverride          = require("method-override"),
    flash                   = require("connect-flash");

        
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index")


mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

var url = process.env.DATABASEURL || "mongodb://localhost/trekkers";
mongoose.connect(url);
//mongoose.connect("mongodb+srv://shubh:trekkers@trekkers-6lqya.mongodb.net/test?retryWrites=true&w=majority");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());   

//seedDB(); //seed database

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "qwertyu",
    resave: false,
    saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//to  pass currentUser info to all the routes to display navbar with login logout correctly
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error  = req.flash("error");
    res.locals.success  = req.flash("success");

    next();
});

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);


app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log("Yelpcamp server Started");
});