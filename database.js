const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Yash9544@#',
    database: 'food_order_db'
});

db.connect((err) => {
    if(err){
        console.log("Database Connection Failed");
        console.log(err);
    }
    else{
        console.log("Database Connected");
    }
});
module.exports = db;