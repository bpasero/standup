
'use strict';

var socketio = require('socket.io');

var db = require('./db');
var standup = require('./standup');

module.exports.connect = function(server) {
	
	// socket.io config
	var io = socketio.listen(server);
	io.configure(function() {
		io.set('transports', ['xhr-polling']);
		io.set('log level', 1); 
	});
	
	// new client connecting
	io.sockets.on('connection', function(socket) {
		
		// send status
		socket.emit('status', db.getStatus());
		
		// react to actions
		socket.on('start', function(data) { 
			standup.start();
			socket.emit('status', db.getStatus());
		});
		
		socket.on('next', function(data) { 
			standup.next();
			socket.emit('status', db.getStatus());
		});
		
		socket.on('pause', function(data) { 
			console.log('client request: pause'); 
		});
		
		socket.on('stop', function(data) { 
			standup.stop();
			socket.emit('status', db.getStatus());
		});
	});
}