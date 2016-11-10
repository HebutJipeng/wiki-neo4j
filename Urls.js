'use strict';

var mongodb = require('./db');

function Urls(name, url) {
	this.name = name;
	this.url = url;
}

module.exports = Urls;

Urls.save = function(name, url, callback) {
	console.log("-------->this is save");
	var url = {
		name : name,
		url : url
	}

	mongodb.open(function(err, db){
		if (err) {
			return callback(err)
		}

		db.collection('urls', function(err, collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.insert(url, {
				safe: true
			}, function(err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};