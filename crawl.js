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

var seed = {'url': 'http://baike.baidu.com/link?url=Sz9U2RahQrX93XC5gE8r5Brr7ehvnK5qgVn5884UGAgvp-jdipKScL5Vceg30oq9ysa56NMvnpIWg9AoWUo9WPEzK1t3SyZuBffhrhbmyFKdqhxvbaTaQrp5am4nYc23oGNAoUWCcn354wCogFlpWq', 'lemmaId': 3940576};
var start = 0;


/*
var j = request.jar();
var cookie =request.cookie('is_click=1');
j.setCookie(cookie, seed);
* 对于设置cookie的网页
*/

var buff = [];

addBufferPool = function(obj) {
	var $ = cheerio.load(obj);
	var _key = $(".name").toArray();
	var _val = $(".value").toArray();
	
	// var relation = $(".portraitbox").toArray();
	// console.log(relation)

	var _string = ""; 

	var saveObj = objectFormat(arrayFormat(_key), arrayFormat(_val))
	console.log(saveObj)
	
	// saveData(saveObj)
	var _seed = buff.shift()
	fetchIMG(_seed)
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
					if ('undefined' == typeof(y.children[0].data)) {
						continue
					} else {
						try{
							_queue.push(y.children[0].data.replace(/\n|&nbsp;|\s+/g, ""))
						} catch(e){
							console.log(y.children[0].data)
							return
						}
						
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


saveURL = function(name, url) {
	// saveUrls.save(name, {url: url}, (res) => {
	// 	console.log(res)
	// 	start++;
	// 	if (start <1000) {
	// 		fetchIMG(seed+start, j)
	// 	}
	// });	
	// var $ = cheerio.load(data);
	
	// var _seed = buff.shift()
	// fetchIMG(_seed, j)
}

fetchIMG = function(seed, j) {
		requestSeeds(seed.lemmaId)
		requestContent(seed.url)
}


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
			addBufferPool(body)
		}
	})	
}

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

function addBuffer(data) {
	for(x of data) {
		var _dataArr = x.data
		for(y of _dataArr) {
			buff.push(y)
		}
	}
	// console.log(buff)
}


// acquireData = function(data) {
// 	var $ = cheerio.load(data);
// 	var content = $("#item-tip img").toArray();
// 	for(x of content) {
// 		saveURL(x.attribs.title,x.attribs.src)
// 	}
// }


fetchIMG(seed)

