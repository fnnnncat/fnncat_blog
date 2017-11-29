var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();
var server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
//soceket 连接
io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function(socket) {
    //监听新用户加入
    socket.on('login', function(username) {
        if (users.indexOf(username) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.username = username;
            users.push(username);
            socket.emit('loginSuccess');
            io.sockets.emit('system', username, users.length, 'login');
        };
    });
    //监听用户链接切断
    socket.on('disconnect', function() {
        if (socket.username != null) {
            users.splice(users.indexOf(socket.username), 1);
       //信息传输对象为所有的client，排除当前socket对应的client
            socket.broadcast.emit('system', socket.username, users.length, 'logout');
        }
    });
    //监听用户发布的聊天内容
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.username, msg, color);
    });
    //监听用户发布的聊天图片
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.username, imgData, color);
    });
})

// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,// 强制更新 session
  saveUninitialized: false,// 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}));
// flash 中间件，用来显示通知
app.use(flash());
// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),// 上传文件目录
  keepExtensions: true// 保留后缀
}));

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));
// 路由
routes(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// error page
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  });
});

if (module.parent) {
  module.exports = app;
} else {
  // 监听端口，启动程序
  server.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
  });
}
