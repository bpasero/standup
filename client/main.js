/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

define([
	'socketio'
], function (io) {
	'use strict';

	let socket = io.connect();
	let stage;
	let stats;
	let serverTimeOffset = 0;
	let redmondStatus = 'onenote:https://microsoft.sharepoint.com/teams/DD_OTP/Documents/Ticino/Notebooks/Ticino/Sprints.one#section-id={97CC4DED-1C83-4716-A6D1-C080F036F75D}&end';
	let zurichStatus = 'onenote:https://microsoft.sharepoint.com/teams/DD_OTP/Documents/Ticino/Notebooks/Ticino/Sprints.one#section-id={97CC4DED-1C83-4716-A6D1-C080F036F75D}&end';

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

	function render(stage) {
		let standupRunning = stage && stage.current >= 0;

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
		let stageList = [];
		stageList = stageList.concat(stage.order.map(function (actor, index) {
			let average = '?';
			let averageTime;
			if (stats && stats[actor.name]) {
				let actorStats = stats[actor.name];
				let standupCount = actorStats.standupCount;
				let speakTime = actorStats.speakTime;
				if (standupCount) {
					averageTime = speakTime / standupCount / 1000;
					average = toHHMMSS(averageTime);
				}
			}

			let averageClassName = '-success';
			if (averageTime > 180) {
				averageClassName = '-danger';
			} else if (averageTime > 150) {
				averageClassName = '-warning';
			}

			// Active Speaker
			if (index === stage.current) {
				let actorStart = actor.startTime;
				let diff = Math.max(0, Math.floor((new Date().getTime() - actorStart - serverTimeOffset) / 1000));
				let max = 60 * 3; // 3 minutes
				let color = '#ffffff';

				let className = '-success';
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
					'<span class="label label-default" style="font-size: medium; float: right;">' + toHHMMSS(diff) + ' (&Oslash; ' + average + ')</span>',
					format('<h4><a style="color: {0};" href="{1}">{2}</a></h4>', color, actor.name.toLowerCase() === 'redmond' ? redmondStatus : zurichStatus, actor.name),
					'</span>'
				].join('\n');
			}

			// Previous speaker
			else if (actor.stopTime) {
				let spoken = Math.floor((actor.stopTime - actor.startTime) / 1000);
				let className = '-success';
				if (spoken > 180) {
					className = '-danger';
				} else if (spoken > 150) {
					className = '-warning';
				}

				return [
					'<span class="list-group-item list-group-item-transparent spoken">',
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
	$('#start').on('click', function () {
		socket.emit('start');
	});

	$('#previous').on('click', function () {
		socket.emit('previous');
	});

	$('#next').on('click', function () {
		socket.emit('next');
	});

	$('#shuffle').on('click', function () {
		socket.emit('shuffle');
	});

	$('#stop').on('click', function () {
		socket.emit('stop');
	});

	$('#music').on('click', function () {
		toggleAudio();
	});

	// Helper
	function format(value) {
		let args = [];
		for (let _i = 0; _i < (arguments.length - 1); _i++) {
			args[_i] = arguments[_i + 1];
		}
		if (args.length === 0) {
			return value;
		}

		let str = value;
		let len = args.length;
		for (let i = 0; i < len; i++) {
			str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);
		}

		return str;
	}

	function toggleAudio() {
		let audio = document.getElementsByTagName("audio")[0];
		if (audio && audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	}

	function toHHMMSS(t) {
		let sec_num = parseInt(t, 10); // don't forget the second param
		let hours = Math.floor(sec_num / 3600);
		let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		let seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours < 10) { hours = "0" + hours; }
		if (minutes < 10) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }
		let time = hours + ':' + minutes + ':' + seconds;

		return time;
	}
});