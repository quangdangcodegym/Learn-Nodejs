const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const localStorage = require('local-storage');

const server = http.createServer(function (req, res) {
       readSession(req, res);
});

server.listen(8080, function () {
    console.log('server running at localhost:8080 ')
});

var handlers = {};

handlers.login = function (rep, res) {
        fs.readFile('./views/login.html', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
        });
};

handlers.notfound = function (rep, res) {
    fs.readFile('./views/notfound.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};

handlers.infor = function (req, res) {
// xu ly submit
    var data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
            //- Lấy thông tin từ form login
            data = qs.parse(data);
            //- Tạo thời gian hết hạn cho sessionId
            let expires = Date.now() + 1000*60*60;
            //- Tạo chuỗi để ghi vào sessionId
            let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+expires+"}";
            //- Tạo sessionId ngẫu nhiên
            let tokenId = createRandomString(20);
            //- Ghi sessionId vào server
            createTokenSession(tokenId, tokenSession);
            //- Dùng localStorage để ghi lại sessionId phía client.
            localStorage.set('token', tokenId);
            //- Hiển thị trang infor
            fs.readFile('./views/infor.html', 'utf8', function (err, datahtml) {
                if (err) {
                    console.log(err);
                }
                datahtml = datahtml.replace('{name}', data.name);
                datahtml = datahtml.replace('{email}', data.email);
                datahtml = datahtml.replace('{password}', data.password);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(datahtml);
                return res.end();
            });

    })
    req.on('error', () => {
        console.log('error')
    })
};

var router = {
    'login': handlers.login,
    'infor': handlers.infor,
    'notfound': handlers.notfound
}

var createTokenSession = function (fileName, data){
    fileName = './token/' + fileName;
    fs.writeFile(fileName, data, err => {
    });
}
//tạo ra chuỗi ngẫu nhiên
var createRandomString = function (strLength){
    strLength = typeof(strLength) == 'number' & strLength >0 ? strLength:false;
    if (strLength){
        var possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
        var str='';
        for (let i = 0; i <strLength ; i++) {
            let ramdomCharater = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length));
            str+=ramdomCharater;
        }
        return str;
    }
}
//lấy dữ liệu từ local storage, đọc dữ liệu từ sessionID
var readSession = function(req, res){
    //lấy sessionId từ local storage
    var tokenID = localStorage.get("token");
    if (tokenID){
        var sessionString= "";
        let expires=0;
        //đọc file sessionId tương ứng phía server
        fs.readFile('./token/'+tokenID, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            sessionString = String(data);
            // lấy ra thời gian hết hạn của sessionId
            expires = JSON.parse(sessionString).expires;
            // lấy ra thời gian hiện tại
            var now = Date.now();
            // so sánh thời gian hết hạn với thời hạn của sessionID
            if (expires<now){
                //Đã đăng nhập nhưng hết hạn
                //Thực hành đăng nhập và lư lại
                var parseUrl = url.parse(req.url, true);
                // //get the path
                var path = parseUrl.pathname;
                var trimPath = path.replace(/^\/+|\/+$/g, '');
                var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
                chosenHandler(req, res);
            }
            else {
                // Đã đăng nhập và chưa hết hạn
                // chuyển sang trang dashboard
                fs.readFile('./views/dashboard.html', 'utf8', function (err, datahtml) {
                    if (err) {
                        console.log(err);
                    }
                    datahtml = datahtml.replace('{name}', JSON.parse(sessionString).name);
                    datahtml = datahtml.replace('{email}', JSON.parse(sessionString).email);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(datahtml);
                    return res.end();
                });
            }
        });
    }
    else {
        // chưa đăng nhập
        var parseUrl = url.parse(req.url, true);
        var path = parseUrl.pathname;
        var trimPath = path.replace(/^\/+|\/+$/g, '');
        var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
        chosenHandler(req, res);
    }
}
