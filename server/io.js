
'use strict';

var socketio = require('socket.io');

var db = require('./db');
var standup = require('./standup');

exports.connect = function (server) {

	// socket.io config
	var io = new socketio.Server(server);

	// new client connecting
	io.sockets.on('connection', function (socket) {

		// sync
		sync(socket);

		// react to actions
		socket.on('start', function () {
			standup.start(function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});

		socket.on('previous', function () {
			standup.previous(function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});

		socket.on('next', function () {
			standup.next(function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});

		socket.on('shuffle', function () {
			standup.shuffle(function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});

		socket.on('stop', function () {
			standup.stop(function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});

		socket.on('goto', function (idx) {
			standup.goto(idx, function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});

		socket.on('toggleDiscussionSlot', function (idx) {
			standup.toggleDiscussionSlot(idx, function (err) {
				if (err) {
					console.error(err);
				}

				sync(socket);
			});
		});
	});
}

function sync(socket) {
	db.getStage(function (err, stage) {
		if (err) {
			console.error(err);
		}

		db.getStatistics(function (err, stats) {
			if (err) {
				console.error(err);
			}

			var obj = {
				stage: stage,
				stats: stats,
				time: new Date().getTime()
			}

			socket.emit('sync', obj);
			socket.broadcast.emit('sync', obj);
		});
	});
}