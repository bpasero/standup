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
		
		if (stage) {
			var stageList = ['<div class="list-group">'];
			stageList = stageList.concat(stage.order.map(function(actor, index) {
				if (index === stage.current) {
					return '<a class="list-group-item active">' + actor.name + '</a>'
				}
				
				return '<a class="list-group-item">' + actor.name + '</a>'
			}));
			stageList.push('</div>');

			$('#stage').empty();
			$('#stage').html(stageList.join('\n'));
		} else {
			$('#stage').empty();
		}
	});
	
	// Actions
	$('#start').on('click', function() {
		socket.emit('start');
	});
	
	$('#next').on('click', function() {
		socket.emit('next');
	});
	
	$('#stop').on('click', function() {
		socket.emit('stop');
	});
});