//Followed this tutorial to set up the authentication system
//via passport.js, which I had no prior experience with
//https://www.youtube.com/watch?v=-RCnNyD0L-s&t=1518s
const express = require('express');
const app = express();
const flash = require('express-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const methodOverride = require('method-override')

app.set('port', 5058);

const initializePassport = require('./passport-config');
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [{id: "51321321321321", name: "Justin" , email: "bethelju@oregonstate.edu", password: "password"}];
const ourClaims = [{id: "421312312312", patient: "Neil Cicierega", procedure: "Root Canal", status: "Pending"},
                {id: "321312312312", patient: "Oprah Winfrey", procedure: "Appendectomy", status:"Approved"},
                {id: "133424341432", patient: "Spongebob", procedure: "SUDS Diagnosis", status:"Denied"},
                {id: "423213123123", patient: "Joan of Arc", procedure: "Scoliosis", status:"Pending"},
                {id: "132312312312", patient: "Rene Descartes", procedure: "Ingrown Toenail", status:"Approved"},
                {id: "123231231232", patient: "Albert Camus", procedure: "Triple Bypass", status: "Approved"},
                {id: "123131231233", patient: "David Hume", procedure: "Lumbago", status: "Pending"}]

app.set('view-engine', 'ejs')
app.use(express.urlencoded({
    extended: false
}))
app.use(flash());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session())
app.use(methodOverride('_method'))

app.get("/login", (req, res) => {
    res.render('loginpage.ejs');
});

app.get("/claims", checkAuthenticated, (req, res) => {
    res.render('viewsubmittedclaims.ejs', {claims : ourClaims})
})

app.get("/", (req, res) => {
    res.redirect("/login");
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/claims',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login');
})

//Middleware function to check if current user is authenticated
//If so, go to next function
//Else redirect to log in page
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

app.listen(app.get('port'), function(){
    console.log("SERVER IS RUNNING");
})