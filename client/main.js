/// <reference path="./declare/jquery.d.ts" />

define([
	'socketio'
], function(io) {
	'use strict';
	
	var socket = io.connect();
	var stage; 
	var serverTimeOffset = 0;
	
	socket.on('sync', function(time) {
		serverTimeOffset = new Date().getTime() - time;
		console.log(serverTimeOffset);
	});
	
	socket.on('status', function(status) {
		stage = status.stage;
		render(stage);
	});
	
	setInterval(function() {
		render(stage);
	}, 1000);
	
	function render(stage) {
		if (stage) {
			var stageList = ['<div class="list-group">'];
			stageList = stageList.concat(stage.order.map(function(actor, index) {
				if (index === stage.current) {
					var actorStart = actor.time;
					var diff = Math.max(0, Math.floor((new Date().getTime() - actorStart - serverTimeOffset) / 1000));
					
					return '<a class="list-group-item active">' + actor.name + '<span class="badge">' + diff + 's</span></a>'
				}
				
				return '<a class="list-group-item">' + actor.name + '</a>'
			}));
			stageList.push('</div>');

			$('#stage').empty();
			$('#stage').html(stageList.join('\n'));
		} else {
			$('#stage').empty();
		}
	}
	
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