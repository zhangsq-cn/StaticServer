var http = require('http');
var zlib = require('zlib');
var url = require('url');
var fs = require('fs');
var path = require('path');

var config = require('./config'),
	serverSetting = config.serverSetting,
	mimeType = config.mimeType,
	expires = config.expires,
	compress = config.compress;

function pathHandle (request, response, realPath, pathname) {
	fs.stat(realPath, function (err, stats) {
		if (err) {
			//文件不存在时返回404
			response.writeHead(404, 'Not Found', {'Content-Type' : mimeType['txt']});			
			response.write('This request URL ' + pathname + ' was not found on this server');
			response.end();
		} else {
			if (stats.isDirectory()) {
				//如果路径是文件夹自动加上默认文件
				realPath = path.join(realPath, '/', serverSetting.defaultFile);
				pathHandle(realPath);
			} else {
				//根据扩展名确定Content-Type
				var ext = path.extname(realPath);
				ext = ext ? ext.slice(1) : 'unknown';
				var contentType = mimeType[ext] || 'text/plain';
				response.setHeader('Content-Type', contentType);

				//设置返回头中文件修改时间
				var lastModified = stats.mtime.toUTCString();
				var ifModifiedSince = 'If-Modified-Since'.toLowerCase();
				response.setHeader('Last-Modified', lastModified);

				if (ext.match(expires.fileMatch)) {
					//返回头中设置过期时间
					var date = new Date();
					date.setTime(date.getTime() + expires.maxAge);
					response.setHeader('Expires', date.toUTCString());
					response.setHeader('Cache-Control', 'max-age=' + expires.maxAge);
				}

				if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
					//如果文件未过期返回304
					response.writeHead(304, 'Not Modified');
					response.end();
				} else {
					var raw = fs.createReadStream(realPath);
					var acceptEncoding = request.headers['accept-encoding'] || '';
					var matched = serverSetting.gzip ? ext.match(compress.match) : null;

					//判断是否启用GZip
					if (matched && acceptEncoding.match(/\bgzip\b/)) {
						response.writeHead(200, 'OK', {'Content-Encoding' : 'gzip'});
						raw.pipe(zlib.createGzip()).pipe(response);
					} else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
						response.writeHead(200, 'OK', {'Content-Encoding' : 'deflate'});
						raw.pipe(zlib.createDeflate()).pipe(response);
					} else {
						response.writeHead(200, 'OK');
						raw.pipe(response);
					}
				}
			}
		}
	});
}

var server = http.createServer(function (request, response) {
	var pathname = url.parse(request.url).pathname;
	if (pathname.slice(-1) === '/') {
		pathname = pathname + serverSetting.defaultFile;
	}
	var realPath = path.join(serverSetting.rootPath, path.normalize(pathname.replace(/\.\./g, '')));
	

	fs.exists(realPath, function (exists) {
		if (!exists) {
			response.writeHead(404, {'Content-Type' : 'text/plain'});
			response.write('This request URL ' + pathname + ' was not found on this server.');
			response.end();
		} else {
			var ext = path.extname(realPath);
			ext = ext ? ext.slice(1) : 'unknown';
			response.setHeader('Content-Type', mimeType[ext] || 'unknown');
			
			pathHandle(request, response, realPath, pathname);
		}
	});
});
server.listen(serverSetting.port);
console.log('Server runing at port: ' + serverSetting.port);