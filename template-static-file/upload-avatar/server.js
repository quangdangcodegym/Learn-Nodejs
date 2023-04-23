let http = require('http');
let fs = require('fs');
let formidable = require('formidable');

let users = [];

let server = http.createServer(function (req, res) {
    if (req.method === 'GET') {
        fs.readFile('./views/register.html', function (err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
        });
    } else {
        // Khởi tạo biến form bằng IncomingForm để phân tích một tập tin tải lên
        let form = new formidable.IncomingForm();
        // Cấu hình thư mục sẽ chứa file trên server với hàm .uploadDir
        form.uploadDir = "upload/"
        // Xử lý upload file với hàm .parse
        form.parse(req, function (err, fields, files) {
            // Tạo đối tượng user
            let userInfo = {
                name: fields.name,
                email: fields.email,
                password: fields.password,
            };

            if (err) {
                // Kiểm tra nếu có lỗi
                console.error(err.message);
                return res.end(err.message);
            }
            // Lấy ra đường dẫn tạm của tệp tin trên server
            let tmpPath = files.avatar.filepath;
            // Khởi tạo đường dẫn mới, mục đích để lưu file vào thư mục uploads của chúng ta
            let newPath = form.uploadDir + files.avatar.originalFilename;
            // Tạo thuộc tính avatar và gán giá trị cho nó
            userInfo.avatar = newPath;
            // Đổi tên của file tạm thành tên mới và lưu lại
            fs.rename(tmpPath, newPath, (err) => {
                if (err) throw err;
                let fileType = files.avatar.mimeType;
                let mimeTypes = ["image/jpeg", "image/jpg", "image/png"];
                if (mimeTypes.indexOf(fileType) === -1) {
                    res.writeHead(200, {"Content-Type": "text/html"});
                    return res.end('The file is not in the correct format: png, jpeg, jpg');
                }
            });
            users.push(userInfo);
            console.log(users)
            return res.end('Register success!');
        });
    }
});

server.listen(8080, function () {
    console.log('server running at localhost:8080 ')
});