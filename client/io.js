define([
	'socketio'
], function(io) {
	'use strict';

	var connect = function(callback) {
		var socket = io.connect(); 
		
		socket.on('status', function(data) {
			callback(socket, data);
		});
	}

	return {
		connect: connect
	};
});