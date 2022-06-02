const mysql = require('like-mysql')
const db = mysql('127.0.0.1:3306', 'root', '', 'sm_master');
// wait until a connection is established
db.ready()

module.exports = db;