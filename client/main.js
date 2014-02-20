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
		var stageList = ['<div class="list-group">'];
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
				
				var percentageDone = 0;
				if (diff >= max) {
					percentageDone = 100;
				} else {
					percentageDone = (diff / max) * 100;
				}
				
				return [
					format('<a class="list-group-item active"><h3>{0}</h3>', actor.name),
					'<div class="progress progress-striped">',
					format(' <div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="{1}" aria-valuemin="0" aria-valuemax="100" style="width: {2}%">', className, percentageDone, percentageDone),
					format('   <span class="sr-only">{0}% Complete</span>', diff),
					' </div>',
					'</div></a>'
				].join('\n');
			}
			
			return '<a class="list-group-item">' + actor.name + '</a>'
		}));
		stageList.push('</div>');

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
});