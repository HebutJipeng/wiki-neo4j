var http = require('http');
var request = require('request');
var cheerio = require('cheerio');
var url = require("url");
var events = require('events');
var emitter = new events.EventEmitter();
var pinyin = require('./libs/pinyin/pinyin.js')

function parsePage(body) {
    var data = {};
    var $ = cheerio.load(body);

    data.city = {};
    data.city.api = $(".cm_area_big").text();
    data.city.area = $(".cm_location").text();
    data.city.time = $(".cm_updatetime").text();
    data.city.quality = $(".cm_area_level").children().first().text();
    for(var i=1; i<8; i++) {
    	if ($(".cm_area_level").children().first().hasClass("cm_area_level"+i)) {
    		data.city.level = "cm_area_level"+i;
    	}
    }
    data.city.density = $(".cm_nongdu").text();

    data.tips = [];
    $(".c_item").each(function() {
        if (!$(this).find("h3").text()) {
            return;
        }
        var _data = {}
        _data.title = $(this).find("h3").text();
        _data.content = $(this).find("p").text();
        data.tips.push(_data);
    })

    data.station = []
    $(".ci_jiance_line").each(function() {
        var _temp = {}
        _temp.area = $(this).find(".ci_location").text();
        _temp.pm2_5 = $(this).find(".ci_pm25num").text();
        if (!$(this).find(".bglevel_common").text()) {
            _temp.api = $(this).find(".ci_aqi").find("span").text().replace(/\n|&nbsp;|\s+/g, "");
        } else {

            _temp.api = $(this).find(".bglevel_common").text().replace(/\n|&nbsp;|\s+/g, "");
            for(var i=1; i<8; i++) {
		    	if ($(this).find(".bglevel_common").hasClass("bglevel_"+i)) {
		    		_temp.level = "bglevel_"+i;
		    	}
		    }
        }
        data.station.push(_temp);
    })

    console.log("--------->", data);
    emitter.emit('ajaxend', data);
}


function requestSeeds(city) {
    request({
        url: 'http://m.pm25.com/wap/city/'+pinyin.pinyinWithOutYin(city).replace(/\n|&nbsp;|\s+/g, "")+'.html',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36'
        }

    }, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            return parsePage(body);
        }
    })
}

http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    })

    var params = url.parse(req.url, true).query;
    try {
	    requestSeeds(params.city);
    } catch(el) {

    }

    emitter.on('ajaxend', function(arg) {
        res.end(JSON.stringify(arg))
    });
}).listen(8888)
