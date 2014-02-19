
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
		db.getStatus(function(err, status) {
			if (err) {
				console.error(err);
			}
			
			socket.emit('status', status);
			
			// react to actions
			socket.on('start', function() { 
				standup.start(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStatus(socket);
				});
			});
			
			socket.on('next', function() { 
				standup.next(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStatus(socket);
				});
			});
			
			socket.on('stop', function() { 
				standup.stop(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStatus(socket);
				});
			});
		});
	});
}

function broadcastStatus(socket) {
	db.getStatus(function(err, status) {
		if (err) {
			console.error(err);
		} else {
			socket.emit('status', status);
			socket.broadcast.emit('status', status);
		}
	});
}