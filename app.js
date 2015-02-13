var connect = require('connect');
var logger = require('./lib/logger');
var checkFile = require('./lib/checkFile');
var handleFile = require('./lib/handleFile');
var output = require('./lib/output');

var serverSetting = require('./config').serverSetting,
    port = serverSetting.port,
    dirs = serverSetting.directory,
    primary = serverSetting.primaryDirectory;

var dirReg = /^\//;

function getDirPath(str) {
    return dirReg.test(str) ?
        str : '/' + str;
}

var app = connect();
// 为不同的虚拟目录添加中间件
dirs.forEach(function (dir) {
    app.use(getDirPath(dir.name), checkFile(dir));
});
// 主目录中间件
app.use(getDirPath(primary.name), checkFile(primary));
// 读取文件信息中间件
app.use(handleFile);
// 日志中间件
app.use(logger);
// 输出中间件
app.use(output);


app.listen(port);
console.log('Server runing at port ' + port);
