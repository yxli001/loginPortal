const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const passportLocalMongoose = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost:27017/loginPortalDB', {useNewUrlParser: true, useUnifiedTopology: true})

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(session({ secret: 'Thisismylittlesecret.', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy())

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})

app.get('/', function(req, res) {
    let statusMsg = ""
    if (req.isAuthenticated()) {
        statusMsg = "Currently Logged in as " + req.user.username + "."
    } else {
        statusMsg = "Currently not logged in."
    }
    res.render('index', {statusMsg: statusMsg})
})

app.get('/login', function(req, res){
    res.render('login')
})

app.post('/login', function(req, res) {
    const user = new User({
        username: req.body.username, 
        password: req.body.password
    })

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, function(err) {
                res.redirect('/')
            })
        }
    })
})

app.get('/signup', function(req, res) {
    res.render('signup')
})

app.post('/signup', function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            res.redirect('/signup')
        } else {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/')
            })
        }
    })
})

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})

app.listen(3000, function() {
    console.log("Server listening on port 3000...");
})