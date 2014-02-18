/// <reference path="../../declare/socket.io.d.ts" />

define([
	'socketio'
], function(io) {
		'use strict';

		var ioConnect = function() {
			var socket = io.connect('https://' + window.location.hostname);
			
			/*socket.on('news', function(data) {
				console.log(data);
				socket.emit('my other event', { my: 'data' });
			});*/
		}

	return {
			ioConnect: ioConnect
		};
});