/// <reference path="./declare/jquery.d.ts" />

define([
	'socketio'
], function(io) {
	'use strict';
	
	var socket = io.connect();
	var stage; 
	var stats;
	var serverTimeOffset = 0;
	
	var redmondStatus = 'onenote:http://devdiv/sites/monaco/Docs/Team%20Notebook/Zollikon/Standups%20(Redmond).one#section-id={9497D85E-923C-40F5-8178-DAB487CEC321}&end';
	var zurichStatus = 'onenote:http://devdiv/sites/monaco/Docs/Team%20Notebook/Zollikon/Standups%20(Zurich).one#section-id={89C56F44-3816-41D5-A5C2-7A997F3540B7}&end';
	
	// sync from server to client
	socket.on('sync', function(s) {
		stage = s.stage;
		stats = s.stats;
		serverTimeOffset = new Date().getTime() - s.time;
		
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
			
			if (stage.current > 0) {
				$('#previous').removeClass('disabled');
			} else {
				$('#previous').addClass('disabled');
			}
		} else {
			$('#start').removeClass('disabled');
			$('#previous').addClass('disabled');
			$('#next').addClass('disabled');
			$('#shuffle').removeClass('disabled');
			$('#stop').addClass('disabled');
		}
		
		// Stage
		var stageList = [];
		stageList = stageList.concat(stage.order.map(function(actor, index) {
			var average = '?';
			var averageTime;
			if (stats && stats[actor.name]) {
				var actorStats = stats[actor.name];
				var standupCount = actorStats.standupCount;
				var speakTime = actorStats.speakTime;
				if (standupCount) {
					averageTime = speakTime / standupCount / 1000;
					average = toHHMMSS(averageTime);
				}
			}
			
			var averageClassName = '-success';
			if (averageTime > 150) {
				averageClassName = '-danger';
			} else if (averageTime > 120) {
				averageClassName = '-warning';
			}
			
			// Active Speaker
			if (index === stage.current) {
				var actorStart = actor.startTime;
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
				
				if (diff >= max && diff%2 === 0) {
					$(window.document.body).addClass("alerting");
				} else if (diff >= max && diff%2 === 1) {
					$(window.document.body).removeClass("alerting");
				}
				
				// Team Lead does not get any restrictions :)
				if (actor.name.indexOf('Team Lead') >= 0) {
					className = '-success';
					color = '#ffffff'
				}
				
				return [
					'<span class="list-group-item list-group-item' + className + '">',
					'<span class="label label-default" style="font-size: medium; float: right;">' + toHHMMSS(diff) + ' (&Oslash; ' + average + ')</span>',
					format('<h3><a style="color: {0};" href="{1}">{2}</a></h3>', color, actor.name.toLowerCase() === 'redmond' ? redmondStatus : zurichStatus, actor.name),
					'</span>'
				].join('\n');
			}
			
			// Previous speaker
			else if (actor.stopTime) {
				var spoken = Math.floor((actor.stopTime - actor.startTime) / 1000);
				var className = '-success';
				if (spoken > 150) {
					className = '-danger';
				} else if (spoken > 120) {
					className = '-warning';
				}
				
				return [
					'<span class="list-group-item list-group-item-transparent">',
					'<span class="label label' + averageClassName + '" style="font-size: small; float: right; margin-left: 5px;">&Oslash; ' + average + '</span>',
					'<span class="label label' + className + '" style="font-size: small; float: right;">' + toHHMMSS(spoken) + '</span>',
					'<h4>' + actor.name + '</h4>',
					'</span>'
				].join('\n');
			}
			
			// Future speaker
			return '<span class="list-group-item list-group-item-transparent"><h4>' + actor.name + '</h4></span>'
		}));

		$('#stage').empty();
		$('#stage').html(stageList.join('\n'));
	}
	
	// Actions
	$('#start').on('click', function() {
		socket.emit('start');
	});
	
	$('#previous').on('click', function() {
		socket.emit('previous');
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
	
	function toHHMMSS(t) {
	    var sec_num = parseInt(t, 10); // don't forget the second param
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);
	
	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    var time    = hours+':'+minutes+':'+seconds;
		
	    return time;
	}
});