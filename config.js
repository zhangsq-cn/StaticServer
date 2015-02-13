//服务器基本设置
exports.serverSetting = {
	//端口
	"port" : 80,
    "primaryDirectory" : {
        "name" : "/",
        // 真实路径
        "path" : "./assets",
        // 是否启用内容压缩
        "zip" : true,
        // 默认首页
        "defaultFile" : "index.html",
        // 是否允许目录浏览
        "indexes" : true
    },
    //虚拟目录
    "directory" : [
        /*{
            // 虚拟目录名称
            "name" : "/assets",
            // 真实路径
            "path" : "./assets",
            // 是否启用内容压缩
            "zip" : true,
            // 默认首页
            "defaultFile" : "default.html",
            // 是否允许目录浏览
            "indexes" : true
        }*/
    ]
};

//mimeType设置
exports.mimeType = {
	"css" 	: "text/css",
	"gif" 	: "image/gif",
	"html" 	: "text/html",
	"ico" 	: "image/x-icon",
	"jpeg" 	: "image/jpeg",
	"jpg" 	: "image/jpeg",
	"js" 	: "text/javascript",
	"json" 	: "application/json",
	"pdf" 	: "application/pdf",
	"png" 	: "image/png",
	"svg" 	: "image/svg+xml",
	"swf" 	: "application/x-shockwave-flash",
	"tiff" 	: "image/tiff",
	"txt" 	: "text/plain",
	"wav" 	: "audio/x-wav",
	"wma" 	: "audio/x-ms-wma",
	"wmv" 	: "video/x-ms-wmv",
	"xml" 	: "text/xml"
};

//缓存设置
exports.expires = {
	fileMatch : /^(gif|png|jpg|js|css)$/ig,
	maxAge : 606024365
};

//GZip压缩选项
exports.compress = {
	match : /css|js|html/ig
};