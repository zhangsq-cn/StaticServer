var colors = require('colors');

module.exports = function logger(req, res, next) {
    //console.log('%s  %s  %s', req.method, res.__info__.statusCode, req.url);
    var statusCode = res.__info__.statusCode;
    //console.log('%s  %s[%s]  %s', req.method, statusCode, statusCode === 404 ? 'red' : (statusCode === 304 ? 'yellow' : 'green'), req.url);
    console.log(req.method + '  ' + statusCode.toString()[
        statusCode === 404 ? 'red' :
            statusCode === 304 ? 'yellow' : 'green'
        ] + '  ' + req.url);
    next();
};