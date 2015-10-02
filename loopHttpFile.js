var url = require('url');
var http = require('http');
var host = 'http://lib.sinaapp.com';
var fs = require('fs');
//读取url内容返回值
function read(urls, callback) {
	var urlData = url.parse(urls);
	var opt = {
			host: urlData.hostname,
			port: '80',
			method: 'GET',
			path: urlData.pathname
		}
		// console.log(opt.host,opt.path);
	var body = '';
	// var req = http.request(opt, function(res) {
	var req = http.request(urls, function(res) {
		res.on('data', function(d) {
			body += d;
		}).on('end', function() {
			// console.log(res.headers);
			callback(body)
		});
	}).on('error', function(e) {
		body = e.message;
		callback(body)
	})
	req.end();

}

function getAHref(htmlstr) {
	var reg = /<a.+?href=('|")?([^'"]+)('|")?(?:\s+|>)/gim;
	var arr = [];
	while (tem = reg.exec(htmlstr)) {
		tem[2].indexOf('http') < 0 && arr.push(tem[2]);
	}
	return arr;
}

function loopCreatFile(url) {
	read(url, function(data) {
		var hrefArr = getAHref(data);
		hrefArr.forEach(function(item) {
			if (item.indexOf('/?') > -1) {
				var pathArr = item.split('path=');
				var dirObj = getFileDir(pathArr[1]);
				fs.exists(dirObj.fullDir + '/' + dirObj.curDir, function(exists) {
					if (!exists) {
						fs.mkdirSync(dirObj.fullDir + '/' + dirObj.curDir)
					}
				})
				loopCreatFile(host + item)
			} else {
				if (item.indexOf('?path=') < 0) {
					var pathArr = item.split('/js/');
					var dirObj = getFileDir(pathArr[1])
					console.log(dirObj.fullDir, dirObj.curDir)
					read(host + item, function(data) {
						try {
							fs.writeFileSync(dirObj.fullDir + '/' + dirObj.curDir, data)
						} catch (e) {
							console.log(e);
						}

					})
				}

			}
		})
	})
}

function getFileDir(str) {
	var obj = {}
	var dirArr = str.split('/');
	obj.curDir = dirArr.pop();
	obj.fullDir = dirArr.join('/') == '' ? 'lib/' : 'lib/' + dirArr.join('/');
	// console.log(dirArr,obj.fullDir)
	return obj;


}
loopCreatFile('http://lib.sinaapp.com')
	// read('http://lib.sinaapp.com', function(data) {
	// 	var hrefListArr = getAHref(data);
	// 	console.log(hrefListArr);
	// 	// fs.exists(,function(exists){
	// 	// 	if(!exists){
	// 	// 		fs.mkdirSync()
	// 	// 	}
	// 	// })
	// })