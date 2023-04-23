const mysql = require('mysql');
const http = require('http');
const url = require('url');
const qs = require('qs');
let fs = require('fs');
let formidable = require('formidable');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Raisingthebar123!!/',
  database: 'dbTest',
  charset: 'utf8_general_ci'
});

connection.connect(function (err) {
  if (err) {
    throw err.stack;
  }
  else {
    console.log("connect success");
  }
});

var handlers = {};

handlers.showUsers = function (req, res) {

  /**
  let dataFile = '';
    let html = '';
    fs.readFile('./data/data.txt','utf8', function (err, str) {
        dataFile = str.split(",")
        dataFile.forEach((value, index) => {
            html += '<tr>';
            html += `<td>${index + 1}</td>`
            html += `<td>${value}</td>`
            html += `<td><button class="btn btn-danger">Delete</button></td>`
            html += '</tr>';
        });
    });
     */
  let html = "";
  const sqlSelect = 'SELECT * FROM customer';
  connection.query(sqlSelect, (err, results, fields) => {
    if (err) throw err;
    console.log(results);
    results.forEach((value, index) => {
      html += '<tr>';
      html += `<td>${index + 1}</td>`
      html += `<td>${value.name}</td>`
      html += `<td>${value.address}</td>`
      html += `<td>
        <a href='/add'><button class="btn btn-primary">Add</button></a>
        <a href='/edit?id=${index + 1}'><button class="btn btn-primary">Add</button></a>
        <a href='/delete?id=${index + 1}'> <button class="btn btn-danger">Delete</button></a>
       </td>`
      html += '</tr>';
    });

  });


  fs.readFile('./views/user.html', 'utf8', function (err, data) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    data = data.replace('{list-user}', html)
    res.write(data)
    res.end()
  });

};
handlers.addUser = function (req, res) {
  if (req.method === 'GET') {
    fs.readFile('./views/add.html', 'utf8', function (err, data) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      data = data.replace('{message}', '');
      res.write(data);
      return res.end();
    });
  } else {
    let form = new formidable.IncomingForm();
    // Xử lý upload file với hàm .parse
    form.parse(req, function (err, fields, files) {
      // Tạo đối tượng user
      let userInfo = {
        fullname: fields.fullname,
        address: fields.address
      };

      if (err) {
        // Kiểm tra nếu có lỗi
        console.error(err.message);
        return res.end(err.message);
      }
      let sqlInsert = `INSERT INTO customer (name, address) VALUES ('${userInfo.fullname}', '${userInfo.address}')`;
      connection.query(sqlInsert, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        fs.readFile('./views/add.html', 'utf8', function (err, data) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          data = data.replace('{message}', '<h5>Insert success</h5>');
          res.write(data);
          return res.end();
        });

      });
    });


  }

};
handlers.editUser =async function (req, res) {

  var parseUrl = url.parse(req.url, true);
  var queryStringObject = parseUrl.query;

  let idCustomer = queryStringObject.id;

  if (req.method === 'GET') {
    let sqlWhere = `SELECT * FROM customer WHERE id = ${idCustomer}`;
    let kq;
    await connection.query(sqlWhere, (err, results, fields) => {
      if (err) throw err;
      console.log(results, "where");
      kq = results;
    });

    
    fs.readFile('./views/edit.html', 'utf8', function (err, data) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      data = data.replace('{message}', '');
      data = data.replace('{value-idcustomer}', kq[0].id);
      data = data.replace('{value-fullname}', kq[0].name);
      data = data.replace('{value-address}', kq[0].address);
      res.write(data);
      return res.end();
    });
  } else {

    let form = new formidable.IncomingForm();
    // Xử lý upload file với hàm .parse
    form.parse(req, function (err, fields, files) {
      // Tạo đối tượng user
      let userInfo = {
        fullname: fields.fullname,
        address: fields.address,
        id: fields.idcustomer
      };

      if (err) {
        // Kiểm tra nếu có lỗi
        console.error(err.message);
        return res.end(err.message);
      }

      let sqlUpdate = `UPDATE customer SET address = '${userInfo.address}' , name = '${userInfo.fullname}' WHERE id = ${userInfo.id}`;
      connection.query(sqlUpdate, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");

        /**
        fs.readFile('./views/edit.html', 'utf8', function (err, data) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          data = data.replace('{message}', '<h5>Edit success</h5>');
          data = data.replace('{value-idcustomer}', userInfo.id);
          data = data.replace('{value-fullname}', userInfo.fullname);
          data = data.replace('{value-address}', userInfo.address);
          res.write(data);
          res.end();
        });
         */
        res.writeHead(301, {
          Location: `http://localhost:8080/users`
        }).end();

      });
    });


  };
}
  handlers.deleteUser = function (req, res) {

  };

  handlers.notFound = function (req, res) {

  };

  var router = {
    'users': handlers.showUsers,
    'edit': handlers.editUser,
    'add': handlers.addUser,
    'delete': handlers.deleteUser
  };
  const server = http.createServer((req, res) => {
    try {

      //get url and parse
      var parseUrl = url.parse(req.url, true);
      //
      // //get the path
      var path = parseUrl.pathname;
      var trimPath = path.replace(/^\/+|\/+$/g, '');

      var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notFound;

      chosenHandler(req, res);

    } catch (err) {
      return res.end(err.message);
    }
  });

  server.listen(8080, function () {
    console.log('server running at localhost:8080 ')
  });