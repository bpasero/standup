/// <reference path="./declare/jquery.d.ts" />

define([
	'socketio'
], function (io) {
	'use strict';

	var socket = io.connect();
	var stage;
	var stats;
	var serverTimeOffset = 0;

	// sync from server to client
	socket.on('sync', function (s) {
		stage = s.stage;
		stats = s.stats;
		serverTimeOffset = new Date().getTime() - s.time;

		render(stage);
	});

	setInterval(function () {
		if (stage) {
			render(stage);
		}
	}, 1000);

	window.goto = function (idx) {
		stage.current = Math.max(0, Math.min(idx, stage.order.length));
		render(stage);
		socket.emit('goto', idx);
	}

	window.toggleDiscussionSlot = function (idx) {
		stage.order[idx].discussionSlot = !stage.order[idx].discussionSlot
		socket.emit('toggleDiscussionSlot', idx);
	}

	function render(stage) {
		var standupRunning = stage && stage.current >= 0;

		// Buttons
		if (standupRunning) {
			$('#start').addClass('disabled');
			$('#stop').removeClass('disabled');

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
			$('#stop').addClass('disabled');
		}

		function renderSpeaker(index, actor) {
			var avatar = '';

			if (actor.githubId) {
				avatar = '<img class="avatar" src="https://avatars.githubusercontent.com/u/' + actor.githubId + '" />';
			}
			if (standupRunning && index !== stage.current) {
				return '<h4>' + avatar + '<a href="#" onclick="goto(' + index + ')">' + actor.name + '</a></h4>';
			} else {
				if (index === stage.current || index === 0) {
					return '<h4>' + avatar + actor.name + '</h4>';
				} else {
					return [
						'<span style="float: left; margin-top: 10px; margin-right: 12px;">',
						'<input class="form-check-input" type="checkbox" value="checked" onclick="toggleDiscussionSlot(' + index + ')"' + (actor.discussionSlot ? ' checked' : '') + '>',
						'</span>',
						'<h4>' + avatar + actor.name + '</h4>'
					].join('\n');
				}
			}
		}

		// Stage
		var stageList = [];
		stageList = stageList.concat(stage.order.map(function (actor, index) {
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
			if (averageTime > 180) {
				averageClassName = '-danger';
			} else if (averageTime > 150) {
				averageClassName = '-warning';
			}

			// Active Speaker
			if (index === stage.current) {
				var actorStart = actor.startTime;
				var diff = Math.max(0, Math.floor((new Date().getTime() - actorStart - serverTimeOffset) / 1000));
				diff = isNaN(diff) ? 0 : diff;
				var max = 60 * 3; // 3 minutes
				var color = '#ffffff';

				var className = '-success';
				if (diff > 180) {
					className = '-danger';
				} else if (diff > 150) {
					className = '-warning';
				}

				if (diff > max && diff % 2 === 0) {
					className = '';
					color = '#000000';
				}

				// Team Lead does not get any restrictions :)
				if (actor.name.indexOf('Team Lead') >= 0) {
					className = '-success';
					color = '#ffffff'
				}

				return [
					'<span class="list-group-item list-group-item' + className + '">',
					'<span class="label label-default" style="font-size: medium; float: right; margin-top: 8px;">' + toHHMMSS(diff) + ' (&Oslash; ' + average + ')</span>',
					renderSpeaker(index, actor),
					'</span>'
				].join('\n');
			}

			// Previous speaker
			else if (actor.stopTime) {
				var spoken = Math.floor((actor.stopTime - actor.startTime) / 1000);
				var className = '-success';
				if (spoken > 180) {
					className = '-danger';
				} else if (spoken > 150) {
					className = '-warning';
				}

				return [
					'<span class="list-group-item list-group-item-transparent spoken">',
					'<span class="label label' + averageClassName + '" style="font-size: small; float: right; margin-left: 5px; margin-top: 8px;">&Oslash; ' + average + '</span>',
					'<span class="label label' + className + '" style="font-size: small; float: right; margin-top: 8px;">' + toHHMMSS(spoken) + '</span>',
					renderSpeaker(index, actor),
					'</span>'
				].join('\n');
			}

			// Future speakers
			return '<span class="list-group-item list-group-item-transparent'/* + (standupRunning ? ' hide' : '')*/ + '">' + renderSpeaker(index, actor) + '</span>';
		}));

		$('#stage').empty();
		$('#stage').html(stageList.join('\n'));
	}

	// Actions
	$('#start').on('click', function () {
		stage.current = 0;
		render(stage);
		socket.emit('start');
	});

	$('#previous').on('click', function () {
		stage.current = Math.max(stage.current - 1, 0);
		render(stage);
		socket.emit('previous');
	});

	$('#next').on('click', function () {
		stage.current = Math.min(stage.current + 1, stage.order.length);
		render(stage);
		socket.emit('next');
	});

	$('#stop').on('click', function () {
		stage.current = -1;
		render(stage);
		socket.emit('stop');
	});

	$('#music').on('click', function () {
		toggleAudio();
	});

	$('#confetti').on('click', function () {
		confetti({
			particleCount: 400,
			spread: 180
		});
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
		var hours = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours < 10) { hours = "0" + hours; }
		if (minutes < 10) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }
		var time = hours + ':' + minutes + ':' + seconds;

		return time;
	}
});