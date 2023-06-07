
'use strict';

var http = require('http');
var path = require('path');

var express = require('express');

var index = require('./routes/index');
var image = require('./routes/image');
var db = require('./db');
var io = require('./io');
var standup = require('./standup');

// all environments
var app = express();
app.set('port', process.env.PORT);
app.use(express.favicon());
//app.use(express.logger('default'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'client')));

// routes
app.get('/', index.route);
app.get('/image', image.route);

// db
db.startup(function (error, created) {
	if (error) {
		console.error('error: ' + error.toString());
	} else if (created) {
		console.log('Created new DB');
	} else {
		console.log('Connected to existing DB');
	}

	// initial data
	standup.init(function (error, reinit) {
		if (error) {
			console.error('error: ' + error.toString());
		} else if (reinit) {
			console.log('Reinitialised stage');
		}

		// server & socket.io
		var server = http.createServer(app);
		io.connect(server);

		// listen
		server.listen(app.get('port'), function () {
			console.log('info: Express server listening on port ' + app.get('port'));
		});
	});
});