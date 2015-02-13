var zlib = require('zlib');
var fs = require('fs');
var url = require('url');
var path = require('path');

var statusText = {
    200 : 'OK',
    304 : 'Not Modified',
    404 : 'Not Found'
},
    parentReg = /\/[^\/]+\/?$/;

function writeHeader(req, res) {
    var info = res.__info__,
        status = info.statusCode;
    res.writeHead(status, statusText[status], info.headers);
    return info;
}

function output(req, res, next) {
    var info = res.__info__,
        status = info.statusCode;
    switch (status) {
        case 404:
            output404(req, res, next);
            break;
        case 304:
            output304(req, res, next);
            break;
        default:
            info.isDir ? outputDirectory(req, res, next) : outputFile(req, res, next);
    }
}

function outputFile(req, res, next) {
    var info = res.__info__,
        headers = info.headers,
        encoding = headers['Content-Encoding'],
        raw = fs.createReadStream(info.realPath);

    raw.on('end', function () {
        next();
    });
    switch (encoding) {
        case 'gzip':
            raw.pipe(zlib.createGzip()).pipe(res);
            break;
        case 'deflate':
            raw.pipe(zlib.createDeflate()).pipe(res);
            break;
        default:
            raw.pipe(res);
    }
}

/*function outputDirectory(req, res, next) {

}*/

function output404(req, res, next) {
    res.end('<h1>Not Fount</h1><p>This request URL <em>' + req.url + '</em> was not found on this server</p>');
    next();
}

function output304(req, res, next) {
    res.end();
    next();
}

//function readDirectory(req, res) {
function outputDirectory(req, res) {
    var info = res.__info__,
        realPath = info.realPath,
        pathname = url.parse(req.url).pathname,
        html,
        filePath, fileStat, subPath,
        gzip;
    fs.readdir(realPath, function (err, files) {
        if (!err) {
            gzip = zlib.createGzip();
            gzip.pipe(res);
            gzip.write('<html><head><title>' + pathname + '</title></head><body><h1>' + pathname + '</h1><ul>');
            pathname !== '/' && gzip.write('<li><a href="' + req.url.replace(parentReg, '/') + '">..</a>');
            files.forEach(function (file) {
                filePath = path.join(realPath, file);
                fileStat = fs.statSync(filePath);
                subPath = fileStat.isDirectory() ? file + '/' : file;
                gzip.write('<li><a href="' + path.join(pathname, subPath) + '">' + subPath + '</a></li>');
            });
            gzip.end();
            /*html = '<html><head><title>' + pathname + '</title></head><body><h1>' + pathname + '</h1><ul>';
            html += pathname === '/' ? '' : '<li><a href="#">..</a>';
            files.forEach(function (file) {
                filePath = path.join(realPath, file);
                fileStat = fs.statSync(filePath);
                subPath = fileStat.isDirectory() ? file + '/' : file;
                html += '<li><a href="' + path.join(pathname, subPath) + '">' + subPath + '</a></li>';
            });
            html += '</ul></body></html>';*/
        }
    });
}

module.exports = function (req, res, next) {
    writeHeader(req, res);
    output(req, res, next);
};