var express                 =   require("express"),
    app                     =   express(),
    mongoose                =   require("mongoose"),
    bodyParser              =   require("body-parser"),
    LocalStrategy           =   require("passport-local"),
    passport                =   require("passport"),
    passportLocalMongoose   =   require("passport-local-mongoose"),
    dotenv                  =   require('dotenv').config(),
    flash                   =   require("connect-flash"),
    http                    =   require('http').Server(app),
    io                      =   require('socket.io')(http),
    methodOverride          =   require("method-override");




var todoSchema  = new mongoose.Schema({
        user: String,
        text: String
    
}),
    Todos       = mongoose.model('Todos', todoSchema),
    
    UserSchema  = new mongoose.Schema({
        username: String,
        password: String
    }),
    ProfileSchema= new mongoose.Schema({
        user: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
        about: String,
        favorite: String
    }),
    Profile     = mongoose.model('Profile', ProfileSchema);
    
UserSchema.plugin(passportLocalMongoose); 
var User        = mongoose.model('User', UserSchema);


app.use(flash());
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
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash('error');
    res.locals.success      = req.flash('success');
    res.locals.details      = req.flash('details');
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
           req.flash('error', err.message);
           res.redirect('/register');       
       } else {
        passport.authenticate('local')(req, res, function(){
        req.flash('success', "Welcome " + req.body.username);
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
    failureRedirect: '/login',
    failureFlash: 'Please check your username or password and try again'
}));

app.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', "Hope to see you soon again!");
    res.redirect('/');
});

app.get('/userprofile/:id', todoAppLoggedIn, function(req, res) {
    Profile.find({}, function(err, profile){
        if(err){
            req.flash('error', err.message);
            res.redirect('/userprofile/'+req.use.username);
        } else {
            res.render('userprofile', {profile});
        }
    });
});

app.post('/userprofile/:id', todoAppLoggedIn, function(req, res) {
    var user = {
        id: req.user._id,
        username: req.user.username
    },
        about       = req.body.about,
        favorite    = req.body.favorite,
        userProfile =  {user: user, about: about, favorite: favorite};
        Profile.create(userProfile, function(err, userPro){
            if(err){
            req.flash('error', err.message);
            res.redirect('/userprofile/'+req.user.username);
            } else {
                req.flash('success', "Profile updated");
                res.redirect('/userprofile/'+req.user.username);
            }
        });
});

app.put('/userprofile/:id', todoAppLoggedIn, function(req, res){
    if(!req.body.userdata.favorite || (req.body.userdata.favorite == "None")){
        req.body.userdata.favorite = "";
    }
    Profile.findByIdAndUpdate(req.body.profileId, req.body.userdata, function(err, update){
        if(err){
            req.flash('error', err.message);
            res.redirect('/userprofile/'+req.user.username);
        } else {
            res.redirect('/userprofile/'+req.user.username);
        }
    });
});

app.get('/todoapp', todoAppLoggedIn, function(req, res){
    Todos.find({}, function(err, arrTodo){
        if(err){
            req.flash('error', err.message);
            res.redirect('/todoapp');
            console.log(err)
        } else {
            res.render('todoapp', {arrTodo});
        }
    });
});

app.post('/todoapp', todoAppLoggedIn, function(req, res){
    if(req.body.newTodo){
        var addTodo = new Todos({text: req.body.newTodo, user: req.user.username});
        addTodo.save(addTodo, function(err, arrTodo){
            if(err){
            req.flash('error', err.message);
            res.redirect('/todoapp');
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
            req.flash('error', err.message);
            res.redirect('/todoapp/:id');
        } else {
            res.redirect('/todoapp');
        }
    });
});



app.get('/webchat', function(req, res) {
    res.render('webchat');
    // onlineUser = req.user.username;
});

app.get('/another', function(req, res) {
    res.send("In Development % Beep Beep Pop Pop %");
});

// DEFAULT ROUTE

app.get('*', function(req, res) {
    res.send('404 Not Found');
});


// CHAT JS
// var onlineUser = 'Roy';
io.on('connection', function(socket){
    console.log('a user has connected');
    // console.log(socket.conn.id); 
    console.log('****' + socket.id + "****");
    socket.on('disconnect', function(){
        console.log('a user has disconnected');
        console.log('****' + socket.id + "****");
    });
});

var objOnline = [];
// var userChat = {};
// var userPlusMsg = '';

io.on('connection', function(socket){
  socket.on('chat message', function(msg, name){
    //  console.info("ID: " + socket.id);
    //  userPlusMsg = userChat[socket.id] + ": " + msg;
    //  console.info("full message: " + userPlusMsg);
      io.emit('chat message', msg, name);
    //   io.emit('chat message', onlineUser);
    //   io.emit('online user', onlineUser);
    console.log('message: ' + msg + " name: " + name);
  });
    socket.on('onlineUser', function(name){
        objOnline.push(name);
        // console.log("ID: "+socket.id);
        // userChat[socket.id]=name;
        // console.log("objOnline: "+objOnline);
        io.emit('onlineUser', objOnline);
    });
});

 

// MIDDLEWARE

function todoAppLoggedIn (req, res, next){
    if(req.isAuthenticated()){
        next();
    } else {
        req.flash('error', "Please login first");
        req.flash('details', "Use you account to login or If you are new create an account");
        res.redirect('/login');
    }
}


http.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started...");
});