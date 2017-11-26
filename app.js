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


// var objOnline       = [],
var    userChat        = {};



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
            console.log(err);
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


// SOCKET.IO

io.on('connection', function(socket){
    console.log('a user has connected');
    socket.on('disconnect', function(){
        console.log('a user has disconnected');
        removeUser(socket.id);
        io.emit('offline user', Object.keys(userChat).map(function(key){return userChat[key][0]}));
    });
    socket.on('chat message', function(name, msg, status){
        // console.log(status);
        if(name && !msg && !status) {
            userChat[socket.id]=addUser(name, false);
            // console.log('User added: '+userChat[socket.id]);
            // console.log('***userChar after***');
            // console.info(userChat);
            // console.log('userObj: '+Object.keys(userChat).map(function(key){return userChat[key][0]}));
            io.emit('chat message', Object.keys(userChat).map(function(key){return userChat[key][0]}));
        } else if (!name && msg && !status) {
            io.emit('chat message', userChat[socket.id][0], msg);
        } else if (status) {
            typingStatus(status);
            // console.log(status);
            // console.log('Is typing: '+userChat[socket.id][0]);
            // console.log('nameObj: '+Object.keys(userChat).map(function(key){return userChat[key]}));
            // console.log("arr to pass: "+[userChat[socket.id][0]], [userChat[socket.id][1]]);
            io.emit('chat message', Object.keys(userChat).map(function(key){return userChat[key][0]}), 
            null, [Object.keys(userChat).map(function(key){return userChat[key][0]}), 
            Object.keys(userChat).map(function(key){return userChat[key][1]})]);
        }
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

function addUser (name, stats){
    var arr = Object.keys(userChat).map(function(key) {return userChat[key]});
        if(arr.indexOf(name) != -1){
            arr.push(name + Math.floor(Math.random()*5000));
        } else {
            arr.push(name);
        }
    arr.push(stats);
    // console.log('****userChar****');
    // console.info(arr);
    return [arr[arr.length-2],arr[arr.length-1]];
    // return arr[arr.length-1];
}

function typingStatus(status){
    console.log('****userChar****');
    console.log(status[0]+"*****"+status[1]);
    console.log(userChat[status[0]][1]);
    userChat[status[0]][1]=status[1];
}
            
function removeUser(id){
    if(userChat[id]){
        // objOnline.splice(objOnline.indexOf(userChat[id]), 1);
        console.info(userChat[id]);
        delete userChat[id];
    }
}

http.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started...");
});