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

var todoSchema = new mongoose.Schema({
    // user: String,
    text: String
    
});
var Todos = mongoose.model('Todos', todoSchema);

app.get('/', function(req, res){
    res.render('home');
});

app.get('/todoapp', function(req, res){
    Todos.find({}, function(err, arrTodo){
        if(err){
            console.log(err)
        } else {
            res.render('todoapp', {arrTodo}); 
        }
    })
});

app.post('/todoapp', function(req, res){
    if(req.body.newTodo){
        var addTodo = new Todos({text: req.body.newTodo})
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
app.delete('/todoapp/:id', function(req, res){
    Todos.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err)
        } else {
            res.redirect('/todoapp');
        }
    });
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started...");
});