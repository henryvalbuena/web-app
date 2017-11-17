var express                 =   require("express"),
    app                     =   express(),
    mongoose                =   require("mongoose"),
    bodyParser              =   require("body-parser"),
    LocalStrategy           =   require("passport-local"),
    passport                =   require("passport"),
    passportLocalMongoose   =   require("passport-local-mongoose"),
    dotenv                  =   require('dotenv').config(),
    methodOverride          =   require("method-override");




var todoSchema  = new mongoose.Schema({
    user: String,
    text: String
    
}),
    Todos       = mongoose.model('Todos', todoSchema),
    
    UserSchema  = new mongoose.Schema({
        username: String,
        password: String
    });
    
UserSchema.plugin(passportLocalMongoose); 
var User        = mongoose.model('User', UserSchema);

app.use(express.static(__dirname + "/public"));   
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
mongoose.connect(process.env.DB_URL, {useMongoClient: true});
app.use(require("express-session")({
    secret: '12345qwert',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


app.get('/', function(req, res){
    res.render('home');
});

app.get('/register', function(req, res) {
    res.render('register');
});

app.post('/register', function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
       if(err){
           console.log(err);
       } else {
           passport.authenticate('local')(req, res, function(){
               res.redirect('/');
           });
       }
    });
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}), function(req, res) {
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/todoapp', todoAppLoggedIn, function(req, res){
    Todos.find({}, function(err, arrTodo){
        if(err){
            console.log(err)
        } else {
            res.render('todoapp', {arrTodo});
        }
    });
});

app.post('/todoapp', todoAppLoggedIn, function(req, res){
    if(req.body.newTodo){
        var addTodo = new Todos({text: req.body.newTodo, user: req.user.username})
        addTodo.save(addTodo, function(err, arrTodo){
            if(err){
                console.log(err)
            } else {
                res.redirect('/todoapp');
            }
        });
    } else {
        res.redirect('/todoapp');
    }
});
app.delete('/todoapp/:id', todoAppLoggedIn, function(req, res){
    Todos.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err)
        } else {
            res.redirect('/todoapp');
        }
    });
});

function todoAppLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect('/login');
    }
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started...");
});