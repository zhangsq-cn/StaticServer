var path = require('path');

var config = require('../config'),
    mimeType = config.mimeType,
    expires = config.expires,
    compress = config.compress;

var zipReg = /\b(gzip|deflate)\b/;

module.exports = function (req, res, next) {
    var info = res.__info__,
        opts = info.options,
        ext, lastModified,
        ifModifiedSince, date,
        acceptEncoding, matched,
        headers = info['headers'] = {};
    if (info.statusCode === 404 || info.isDir) {
        date = new Date;
        headers['Content-Type'] = mimeType['html'];
        headers['Last-Modified'] = date.toUTCString();
        headers['Content-Encoding'] = 'gzip';
    } else {
        //设置Content-Type
        ext = path.extname(info.realPath);
        ext = ext ? ext.slice(1) : 'unknown';
        headers['Content-Type'] = mimeType[ext] || 'text/plain';

        //设置Last-Modified
        lastModified = info.stats.mtime.toUTCString();
        headers['Last-Modified'] = lastModified;

        //设置过期时间
        if (ext.match(expires.fileMath)) {
            date = new Date();
            date.setTime(date.getTime() + expires.maxAge);
            headers['Expires'] = date.toUTCString();
            headers['Cache-Control'] = 'max-age=' + expires.maxAge;
        }

        //检查是否返回文件内容
        ifModifiedSince = 'If-Modified-Since'.toLowerCase();
        if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
            info.statusCode = 304;
        } else {
            //判断是否使用压缩
            acceptEncoding = req.headers['accept-encoding'] || '';
            if (matched = opts.zip && ext.match(compress.match) ?
                    acceptEncoding.match(zipReg) : null) {
                headers['Content-Encoding'] = matched[1];
            }
        }
    }
    next();
};