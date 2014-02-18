
'use strict';

var http = require('http');
var path = require('path');

var express = require('express');

var routes = require('./routes');
var db = require('./db');
var io = require('./io');

// all environments
var app = express();
app.set('port', process.env.PORT);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/', routes.index);

// db
db.startup(function(created) {
	if (created) {
		console.log('info: Created a new database file');
	} else {
		console.log('info: Connected to existing database file');
	}

	var server = http.createServer(app);
	
	// socket.io
	io.connect(server);
	
	// listen
	server.listen(app.get('port'), function() {
		console.log('info: Express server listening on port ' + app.get('port'));
	});
});