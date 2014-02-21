/// <reference path="./declare/jquery.d.ts" />

define([
	'socketio'
], function(io) {
	'use strict';
	
	var socket = io.connect();
	var stage; 
	var serverTimeOffset = 0;
	
	var redmondStatus = 'onenote:http://devdiv/sites/monaco/Docs/Team%20Notebook/Zollikon/Standups%20(Redmond).one#section-id={9497D85E-923C-40F5-8178-DAB487CEC321}&end';
	var zurichStatus = 'onenote:http://devdiv/sites/monaco/Docs/Team%20Notebook/Zollikon/Standups%20(Zurich).one#section-id={89C56F44-3816-41D5-A5C2-7A997F3540B7}&end';
	
	socket.on('sync', function(time) {
		serverTimeOffset = new Date().getTime() - time;
	});
	
	socket.on('music', function() {
		toggleAudio();
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
				var color = '#ffffff';
				
				var className = '-success';
				if (diff > 150) {
					className = '-danger';
				} else if (diff > 120) {
					className = '-warning';
				}
				
				if (diff > max && diff%2 === 0) {
					className = '';
					color = '#000000';
				}
				
				return format('<span class="list-group-item list-group-item{0}"><h3><a style="color: {1};" href="{2}">{3}</a></h3></span>', className, color, actor.name.toLowerCase() === 'zurich' ? zurichStatus : redmondStatus, actor.name);
			}
			
			return '<span class="list-group-item list-group-item-transparent">' + actor.name + '</span>'
		}));

		$('#stage').empty();
		$('#stage').html(stageList.join('\n'));
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
		toggleAudio();
	});
	
	// Helper
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
	
	function toggleAudio() {
		var audio = document.getElementsByTagName("audio")[0];
		if (audio && audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	}
});