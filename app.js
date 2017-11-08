var express         =       require("express"),
    app             =       express(),
    mongoose        =       require("mongoose"),
    methodOverride  =   require("method-override");
    
    
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
mongoose.connect("mongodb://localhost/todo", {useMongoClient: true});
app.use(require("express-session")({
    secret: '12345qwert',
    resave: false,
    saveUninitialized: false
}));

app.get('/', function(req, res){
    res.render('home');
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started...");
});