const  mysql = require("mysql2");
const pool = mysql.createPool({
  host:"localhost",
  user:"root",
  password:"@Komalyadav2003",
  database:"airbnb",

});

module.exports =  pool.promise();