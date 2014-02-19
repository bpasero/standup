/// <reference path="./declare/jquery.d.ts" />

define([
	'socketio'
], function(io) {
	'use strict';
	
	var socket = io.connect(); 
		
	socket.on('status', function(status) {
		var users = status.users;
		var stage = status.stage;
		
		if (stage) {
			$('#main').text("Standup running. Current: " + stage.order[stage.current].name);
		} else {
			$('#main').text("Standup not running. Press start to go");
		}
	});
	
	// Actions
	$('#start').on('click', function() {
		socket.emit('start');
	});
	
	$('#next').on('click', function() {
		socket.emit('next');
	});
	
	$('#pause').on('click', function() {
		socket.emit('pause');
	});
	
	$('#stop').on('click', function() {
		socket.emit('stop');
	});
});