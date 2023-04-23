const mysql = require('mysql');
const http = require('http');
const url = require('url');
const qs = require('qs');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Raisingthebar123!!/',
    database: 'dbtest',
    charset: 'utf8_general_ci'
})

connection.connect(function (err) {
    if (err) {
      throw err.stack;
    }
    else {
        console.log("connect success");
        const sql = "CREATE TABLE customer (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,name varchar(30) not null, address varchar(30))";
        connection.query(sql, function (err) {
          if (err) {
            console.log(err);
          };
          console.log('Create table success');
          connection.end();
        });
        return;
    }
  });