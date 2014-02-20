
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
		
		// sync time
		socket.emit('sync', new Date().getTime());
		
		// send status
		db.getStage(function(err, stage) {
			if (err) {
				console.error(err);
			}
			
			socket.emit('stage', stage);
			
			// react to actions
			socket.on('start', function() { 
				standup.start(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStage(socket);
				});
			});
			
			socket.on('next', function() { 
				standup.next(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStage(socket);
				});
			});
			
			socket.on('shuffle', function() { 
				standup.shuffle(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStage(socket);
				});
			});
			
			socket.on('stop', function() { 
				standup.stop(function(err) {
					if (err) {
						console.error(err);
					}
			
					broadcastStage(socket);
				});
			});
			
			socket.on('music', function() { 
				socket.emit('music', true);
				socket.broadcast.emit('music', true);
			});
		});
	});
}

function broadcastStage(socket) {
	db.getStage(function(err, stage) {
		if (err) {
			console.error(err);
		} else {
			socket.emit('stage', stage);
			socket.broadcast.emit('stage', stage);
		}
	});
}