
'use strict';

var socketio = require('socket.io');

var db = require('./db');

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
		db.getStatus(function(status) {
			socket.emit('status', status);
		});
		
		// react to actions
		socket.on('start', function(data) { 
			console.log('start');
			
			db.start(function() {
					
			});
		});
		
		socket.on('next', function(data) { 
			console.log('next'); 
		});
		
		socket.on('pause', function(data) { 
			console.log('pause'); 
		});
		
		socket.on('stop', function(data) { 
			console.log('stop'); 
		});
	});
}