//Followed this tutorial to set up the authentication system
//via passport.js, which I had no prior experience with
//https://www.youtube.com/watch?v=-RCnNyD0L-s&t=1518s
const express = require('express');
const app = express();
const flash = require('express-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mysql = require('./dbconnection');


app.set('port', 5058);

const passport = require('passport');
const initializePassport = require('./passport-config');
initializePassport(passport,
	email => {
		const usr = users.find(user => user.email === email);
		console.log(usr);
		return usr;
	},
	id => users.find(user => user.id === id)
);

let users = [];
loadUsers();

app.set('view-engine', 'ejs');
app.use(express.urlencoded({
	extended: false
}));
app.use(flash());
app.use(session({
	secret: "secret",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get("/login", (req, res) => {
	res.render('loginpage.ejs');
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/claims',
	failureRedirect: '/login',
	failureFlash: true
}));

app.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/login');
});



app.get("/", (req, res) => {
	res.redirect("/login");
});

// app.get("/claims", checkAuthenticated, (req, res) => {
// 	res.render('viewsubmittedclaims.ejs', { claims: ourClaims });
// });
app.get("/claims", (req, res, next) => {
	mysql.pool.query('SELECT * FROM Claims', (err, rows, fields) => {
		if (err) {
			next(err);
			return;
		}
		console.log(rows);
		res.render('viewsubmittedclaims.ejs', { claims: rows });
	});
});

app.get("/createNewClaim", (req, res) => {
	res.render('createNewClaim.ejs', { claim: {} })
});
app.post('/createNewClaim', (req, res, next) => {

	const parms = [parseInt(req.body.claimId), req.body.patientName, req.body.procedureName, req.body.procedureDate, req.body.diagnosis, req.body.doctorName, req.body.operationDate];
	console.log(parms);

	mysql.pool.query("INSERT INTO Claims (ID, Patient, ProcedureName, ProcedureDate, Diagnosis, DoctorName, OperationDate) VALUES (?)",
		[parms],
		function (err, result) {
			//console.log(result);
			if (err) {
				next(err);
				return;
			}
			res.redirect("/claims");
		});

});

app.get("/claim/:claimId", (req, res) => {
	const claimId = req.params.claimId;
	mysql.pool.query('SELECT * FROM Claims where ID = ?', [claimId], (err, rows, fields) => {
		if (err) {
			next(err);
			return;
		}
		const claim = rows[0];
		claim.ProcedureDate = formatDate(claim.ProcedureDate);
		claim.OperationDate = formatDate(claim.OperationDate);
		console.log(rows);
		res.render('createNewClaim.ejs', { claim: rows[0] })
	});
});
app.post('/claim/:claimId', (req, res, next) => {

	const parms = [req.body.patientName, req.body.procedureName, req.body.procedureDate, req.body.diagnosis, req.body.doctorName, req.body.operationDate, parseInt(req.params.claimId)];
	console.log(parms);

	mysql.pool.query("UPDATE Claims SET Patient=?, ProcedureName=?, ProcedureDate=?, Diagnosis=?, DoctorName=?, OperationDate=? WHERE ID = ?",
		parms,
		function (err, result) {
			//console.log(result);
			if (err) {
				next(err);
				return;
			}
			res.redirect("/claims");
		});

});

app.get('/createNewAccount', (req, res) => {
	res.render('createNewAccount.ejs');
});

app.post('/createNewAccount', (req, res, next) => {

	const parms = [req.body.name, req.body.username, req.body.password[0]];
	console.log(parms);

	mysql.pool.query("INSERT INTO Users (Name, Email, Password) VALUES (?)",
		[parms],
		function (err, result) {
			//console.log(result);
			if (err) {
				next(err);
				return;
			}
			loadUsers();
			res.redirect('/login');
		})
});


//Middleware function to check if current user is authenticated
//If so, go to next function
//Else redirect to log in page
function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}


app.listen(app.get('port'), function () {
	console.log("SERVER IS RUNNING");
});

function formatDate(date) { return date && date.toISOString && date.toISOString().substring(0, 10); }

function loadUsers() {
	mysql.pool.query('SELECT ID as id, Name as name, Email as email, Password as password FROM Users', (err, rows, fields) => {
		if (err) {
			return;
		}
		console.log(rows);
		users = rows;
	});
}
