define([
	'socketio'
], function(io) {
		'use strict';

		var ioConnect = function(callback) {
			var socket = io.connect(); //socket.emit('my other event', { my: 'data' });
			
			socket.on('status', function(data) {
				callback(data);
			});
		}

	return {
			ioConnect: ioConnect
		};
});