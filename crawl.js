var http = require('http');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var saveUrls = require('./Urls');
var neo4j = require('node-neo4j');

var db = new neo4j('http://neo4j:123@localhost:7474');

var count = 0;

saveData = obj => {

	db.insertNode(obj, (err, node) => {
		if(err) {
			return console.log('err: --->', err)
		}
		console.log('node: ---->', node)
	});

}

var seed = {'url': 'http://baike.baidu.com/item/%E5%A5%A5%E9%A9%AC%E5%B0%94%C2%B7%E7%A9%86%E9%98%BF%E8%BF%88%E5%B0%94%C2%B7%E5%8D%A1%E6%89%8E%E8%8F%B2?fromtitle=%E5%8D%A1%E6%89%8E%E8%8F%B2&fromid=2024205&type=syn', 'lemmaId': 3673442};

var start = 0;


/*
var j = request.jar();
var cookie =request.cookie('is_click=1');
j.setCookie(cookie, seed);
* 对于设置cookie的网页
*/


//设置缓冲池，用来存放第二次取出的链接
var buff = [];

processData = function(obj) {
	var $ = cheerio.load(obj);
	var _key = $(".name").toArray();
	var _val = $(".value").toArray();
	
	var _string = ""; 

	var saveObj = objectFormat(arrayFormat(_key), arrayFormat(_val))
	console.log(saveObj);
	
	saveData(saveObj)
	var _seed = buff.shift()
	fetchPage(_seed)
}

objectFormat = (arr1, arr2) => {
	var obj = {}

	for( x in arr1) {
		obj[arr1[x]] = arr2[x]
	}

	return obj
}

arrayFormat = arr => {
	var _content = [];

	for(x of arr) {
		if (x.children.length > 1) {
			var _queue = [];
			for(y of x.children) {
				if (y.name == 'br') {
					continue;
				}
				if (y.data) {
					if (y.data != '\n') {
						_queue.push(y.data.replace(/\n|&nbsp;|\s+/g, ""))
					}
					
				} else {
					// console.log(y.children)
					try{
						_queue.push(y.children[0].data.replace(/\n|&nbsp;|\s+/g, ""))
					} catch(e){
						continue
					}
					
				}
			}
			_content.push(queueToArray(_queue))
		} else if(x.children.length == 1) {
			try{
				_content.push(x.children[0].data.replace(/\n|&nbsp;|\s+/g, ""))
			}catch(e) {
				console.log(e)
			}
			
		}
	}

	return _content;
}

queueToArray = que => {
	var queStr = ''
	for ( x of que) {
		queStr = queStr + x
	}
	return  queStr
}

//请求网页内容
function requestContent(urldata) {
	request({
		url: urldata,
		headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36'
	    }
	    // jar: j
	}, function(err, res, body){
		if (!err && res.statusCode == 200) {
			processData(body)
		}
	})	
}


//生成种子
function requestSeeds(seeddata) {
	request({
		url: 'http://baike.baidu.com/wikiui/api/zhixinmap?lemmaId=' + seeddata,
		headers: {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36'
	    }
	    // jar: j
	}, function(err, res, body){
		if (!err && res.statusCode == 200) {
			addBuffer(JSON.parse(res.body))
		}
	})
}

//添加缓冲池
function addBuffer(data) {
	try {
		for(x of data) {
			var _dataArr = x.data
			for(y of _dataArr) {
				buff.push(y)
			}
		}
	} catch(e) {
		console.log("the error data is =======>", data)
		console.log(e)
	}
	
}

//把请求网页和生成种子分为两个部分
fetchPage = function(seed, j) {
		requestSeeds(seed.lemmaId)
		requestContent(seed.url)
}

fetchPage(seed)

