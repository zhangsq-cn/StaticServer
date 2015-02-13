var fs = require('fs');
var url = require('url');
var path = require('path');

function toNext(req, res, info, next) {
    res.__info__ = info;
    next();
}

module.exports = function (opts) {
    return function (req, res, next) {
        var pathname,
            realPath,
            statusCode,
            isDir,
            tmp;

        if (res.__info__) {
            next();
        } else {
            pathname = url.parse(req.url).pathname;
            realPath = path.join(opts.path, pathname);
            statusCode = 200;
            isDir = false;
            fs.stat(realPath, function (err, stats) {
                if (err) {
                    if (pathname === '/favicon.ico') {
                        realPath = './favicon.ico';
                        fs.stat(realPath, function (err, stats) {
                            toNext(req, res, {
                                isDir: isDir,
                                statusCode: statusCode,
                                realPath: realPath,
                                stats: stats,
                                options: opts
                            }, next);
                        });
                    } else {
                        statusCode = 404;
                        toNext(req, res, {
                            isDir: isDir,
                            statusCode: statusCode,
                            realPath: realPath,
                            stats: stats,
                            options: opts
                        }, next);
                    }
                } else {
                    if (stats.isFile()) {
                        isDir = false;
                        toNext(req, res, {
                            isDir: isDir,
                            statusCode: statusCode,
                            realPath: realPath,
                            stats: stats,
                            options: opts
                        }, next);
                    } else if (stats.isDirectory()) {
                        tmp = path.join(realPath, opts.defaultFile);
                        fs.exists(tmp, function (exists) {
                            if (exists) {
                                realPath = tmp;
                                fs.stat(realPath, function (err, stats) {
                                    toNext(req, res, {
                                        isDir: isDir,
                                        statusCode: statusCode,
                                        realPath: realPath,
                                        stats: stats,
                                        options: opts
                                    }, next);
                                });
                            } else {
                                if (opts.indexes) {
                                    isDir = true;
                                } else {
                                    statusCode = 404;
                                }
                                toNext(req, res, {
                                    isDir: isDir,
                                    statusCode: statusCode,
                                    realPath: realPath,
                                    stats: stats,
                                    options: opts
                                }, next);
                            }
                        });
                    }
                }
            });
        }
    };
};