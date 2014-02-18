
'use strict';

var socketio = require('socket.io');

module.exports.connect = function(server) {
	var io = socketio.listen(server);
	io.configure(function() {
		io.set('transports', ['xhr-polling']);
		io.set('log level', 1); 
	});
	
	io.sockets.on('connection', function(socket) {
		
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function(data) {
			console.log(data);
		});
	});
}