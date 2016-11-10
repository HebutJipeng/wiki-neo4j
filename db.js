var mongodb = require('mongodb');
var settings = {
		cookieSecret: 'mycrawl',
		db: 'crawl',
		host: 'localhost',
		port: 27017
	},
	Db = mongodb.Db,
	Connection = mongodb.Connection,
	Server = require('mongodb').Server;
	
module.exports = new Db(settings.db, new Server(settings.host, settings.port), {safe: true});