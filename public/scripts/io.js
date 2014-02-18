/// <reference path="../../declare/socket.io.d.ts" />

define([
	'socketio'
], function(io) {
		'use strict';

		var ioConnect = function() {
			var socket = io.connect(); //socket.emit('my other event', { my: 'data' });
			
			socket.on('status', function(data) {
				console.log(data);
			});
		}

	return {
			ioConnect: ioConnect
		};
});