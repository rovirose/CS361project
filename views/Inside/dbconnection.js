var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'classmysql.engr.oregonstate.edu',
	user: 'cs361_rovirose',
	password: '9343',
	database: 'cs361_rovirose'
})
module.exports.pool = pool;
