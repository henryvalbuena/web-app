var express         =       require("express"),
    app             =       express(),
    mongoose        =       require("mongoose"),
    bodyParser      =       require("body-parser"),
    methodOverride  =       require("method-override");
    
    
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
mongoose.connect("mongodb://localhost/todo", {useMongoClient: true});
app.use(require("express-session")({
    secret: '12345qwert',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));


var arrTodo = ["Clean the closet", "Make the bed"];

app.get('/', function(req, res){
    res.render('home');
});

app.get('/todoapp', function(req, res){
    res.render('todoapp', {arrTodo});
});

app.post('/todoapp', function(req, res){
    if(req.body.newTodo){
    arrTodo.push(req.body.newTodo);
    }
    res.redirect('/todoapp');
});
app.delete('/todoapp/:index', function(req, res){
    console.log(req.params.index);
    arrTodo.splice(req.params.index, 1);
    res.redirect('/todoapp');
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started...");
});