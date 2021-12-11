/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const db = require('./db');
const utils = require('./utils');
const config = require('../config');

exports.init = function (callback) {
	db.needsReinit(function (err, needsReinit) {
		if (err) {
			return callback(err);
		}

		if (needsReinit) {
			db.reinit("", function (err) {
				if (err) {
					return callback(err);
				}

				return exports.shuffle(function (err) {
					if (err) {
						return callback(err);
					}

					return callback(null, true);
				});
			});
		} else {
			return callback(null, false);
		}
	});
};

exports.shuffle = function (callback) {
	let users = config.users;
	let order = utils.shuffleArray(utils.clone(users));

	// Boss is always last
	order.push({
		name: 'Erich Team Lead'
	});

	return db.setStage(-1, order, callback);
};

exports.start = function (callback) {
	db.isRunning(function (err, isRunning) {
		if (err) {
			return callback(err);
		}

		if (isRunning) {
			return callback(new Error("Cannot start a running standup"));
		}

		db.getStage(function (err, stage) {
			if (err) {
				return callback(err);
			}

			let presenter = stage.order[0];
			presenter.startTime = new Date().getTime();

			return db.setStage(0, stage.order, callback);
		});
	});
}

exports.previous = function (callback) {
	function gotoPrevious(stage, c) {

		// Always set the current time as "stop" time for the current presenter before moving on
		stage.order[stage.current].stopTime = new Date().getTime();

		let previous = stage.current - 1;
		let presenter = stage.order[previous];

		// Set a new startTime based on the real spoken time so far
		if (presenter.stopTime) {
			let now = new Date().getTime();
			presenter.startTime = now - (presenter.stopTime - presenter.startTime);
		}

		return db.setStage(previous, stage.order, c);
	}

	db.isRunning(function (err, isRunning) {
		if (err) {
			return callback(err);
		}

		if (!isRunning) {
			return callback(new Error("Cannot previous on a not running standup"));
		}

		let stage = db.getStage(function (err, stage) {
			if (err) {
				return callback(err);
			}

			if (stage && stage.current - 1 >= 0) {

				// Previous
				return gotoPrevious(stage, callback);
			}

			return callback(new Error("Already at the end"));
		});
	});
}

exports.next = function (callback) {
	function gotoNext(stage, c) {

		// Always set the current time as "stop" time for the current presenter before moving on
		stage.order[stage.current].stopTime = new Date().getTime();

		let next = stage.current + 1;
		let presenter = stage.order[next];

		// Set a new startTime based on the real spoken time so far or just use now if not spoken yet
		let now = new Date().getTime();
		if (presenter.stopTime) {
			presenter.startTime = now - (presenter.stopTime - presenter.startTime);
		} else {
			presenter.startTime = now;
		}

		return db.setStage(next, stage.order, c);
	}

	db.isRunning(function (err, isRunning) {
		if (err) {
			return callback(err);
		}

		if (!isRunning) {
			return callback(new Error("Cannot next on a not running standup"));
		}

		let stage = db.getStage(function (err, stage) {
			if (err) {
				return callback(err);
			}

			if (stage && stage.current + 1 < stage.order.length) {

				// Statistics (only if speaker did not get skipped by checking for 5 seconds talk time)
				let current = stage.order[stage.current];
				let talked = new Date().getTime() - current.startTime;
				if (talked > 5000) {
					return db.addStatistics(current, talked, function (err) {
						if (err) {
							return callback(err);
						}

						// Next
						return gotoNext(stage, callback);
					});
				} else {

					// Next
					return gotoNext(stage, callback);
				}
			}

			return callback(new Error("Already at the end"));
		});
	});
}

exports.stop = function (callback) {
	db.getStage(function (err, stage) {
		if (err) {
			return callback(err);
		}

		// Statistics (only if speaker did not get skipped by checking for 5 seconds talk time)
		let current = stage.order[stage.current];
		let talked = new Date().getTime() - current.startTime;
		if (talked > 5000) {
			db.addStatistics(current, talked, function (err) {
				if (err) {
					return callback(err);
				}

				// Stop
				return db.setStage(-1, stage.order, callback);
			});
		} else {

			// Stop
			return db.setStage(-1, stage.order, callback);
		}
	});
}