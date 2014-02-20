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
	});
	
	socket.on('music', function() {
		var audio = document.getElementsByTagName("audio")[0];
		if (audio && audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	});
	
	socket.on('stage', function(s) {
		stage = s;
		render(stage);
	});
	
	setInterval(function() {
		if (stage) {
			render(stage);
		}
	}, 1000);
	
	function render(stage) {
		var standupRunning = stage && stage.current >= 0;
		
		// Buttons
		if (standupRunning) {
			$('#start').addClass('disabled');
			$('#stop').removeClass('disabled');
			$('#shuffle').addClass('disabled');
			
			if (stage.current + 1 < stage.order.length) {
				$('#next').removeClass('disabled');
			} else {
				$('#next').addClass('disabled');
			}
		} else {
			$('#start').removeClass('disabled');
			$('#next').addClass('disabled');
			$('#shuffle').removeClass('disabled');
			$('#stop').addClass('disabled');
		}
		
		// Stage
		var stageList = [];
		stageList = stageList.concat(stage.order.map(function(actor, index) {
			if (index === stage.current) {
				var actorStart = actor.time;
				var diff = Math.max(0, Math.floor((new Date().getTime() - actorStart - serverTimeOffset) / 1000));
				var max = 60 * 3; // 3 minutes
				
				var className = 'success';
				if (diff > 150) {
					className = 'danger';
				} else if (diff > 120) {
					className = 'warning';
				}
				
				return [
					format('<span class="list-group-item list-group-item-{0}" style="border-top-left-radius: 0; border-top-right-radius: 0;"><h3>{1}</h3></span>', className, actor.name)
				].join('\n');
			}
			
			return '<span class="list-group-item" style="border-top-left-radius: 0; border-top-right-radius: 0;"><h5>' + actor.name + '</h5></span>'
		}));

		$('#stage').empty();
		$('#stage').html(stageList.join('\n'));
	}
	
	function format(value) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        if (args.length === 0) {
            return value;
        }

        var str = value;
        var len = args.length;
        for (var i = 0; i < len; i++) {
            str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);
        }

        return str;
    }
	
	// Actions
	$('#start').on('click', function() {
		socket.emit('start');
	});
	
	$('#next').on('click', function() {
		socket.emit('next');
	});
	
	$('#shuffle').on('click', function() {
		socket.emit('shuffle');
	});
	
	$('#stop').on('click', function() {
		socket.emit('stop');
	});
	
	$('#music').on('click', function() {
		socket.emit('music');
	});
});