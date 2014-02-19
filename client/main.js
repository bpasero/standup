/// <reference path="./declare/jquery.d.ts" />

define([
	'socketio'
], function(io) {
	'use strict';
	
	var socket = io.connect(); 
		
	socket.on('status', function(status) {
		
		// Runtime
		var users = status.users;
		var runtime = status.runtime;
		
		if (runtime.current) {
			$('#main').text("Current: " + runtime.current);
		} else {
			$('#main').text("Press start to go");
		}
	});
	
	// Actions
	$('#start').on('click', function() {
		console.log("start");
		
		socket.emit('start');
	});
	
	$('#next').on('click', function() {
		console.log("next");
		
		socket.emit('next');
	});
	
	$('#pause').on('click', function() {
		console.log("pause");
		
		socket.emit('pause');
	});
	
	$('#stop').on('click', function() {
		console.log("stop");
		
		socket.emit('stop');
	});
});