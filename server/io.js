
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
	// socket.on('my other event', function(data) { console.log(data); });
	io.sockets.on('connection', function(socket) {
		db.getUsers(function(users) {
			socket.emit('status', { 
				users: users
			});
		});
	});
}