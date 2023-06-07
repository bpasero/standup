
'use strict';

var fs = require('fs');
var path = require('path');

var db = require('./db');
var utils = require('./utils');
var config = require('../config');

exports.init = function (callback) {
	db.needsReinit(function (err, needsReinit) {
		if (err) {
			return callback(err);
		}

		if (needsReinit) {
			db.reinit(function (err) {
				if (err) {
					return callback(err);
				}

				return reset(function (err) {
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

function reset(c) {
	var order = utils.clone(config.users)
		.sort(function (a, b) {
			return a.name.localeCompare(b.name);
		});;

	// Boss is always first
	order.unshift({
		name: 'Endgame & Team Leads'
	});

	return db.setStage(-1, order, c);
}

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

			// Team lead slot
			var teamLeadSlot = stage.order.splice(0, 1)[0];

			// Discussion Slot
			var discussionSlot = [];
			stage.order.forEach(function (element) {
				if (element.discussionSlot) {
					discussionSlot.push(element);
				}
			});
			discussionSlot = utils.shuffleArray(discussionSlot)

			// Status Slot
			var statusSlot = [];
			stage.order.forEach(function (element) {
				if (!element.discussionSlot) {
					statusSlot.push(element);
				}
			});
			statusSlot = utils.shuffleArray(statusSlot)

			stage.order = [teamLeadSlot];;
			discussionSlot.forEach(function (element) {
				delete element.discussionSlot;
				stage.order.push(element);
			});
			statusSlot.forEach(function (element) {
				stage.order.push(element);
			});

			var presenter = stage.order[0];
			presenter.startTime = new Date().getTime();

			return db.setStage(0, stage.order, callback);
		});
	});
}

exports.previous = function (callback) {
	function gotoPrevious(stage, c) {

		// Always set the current time as "stop" time for the current presenter before moving on
		stage.order[stage.current].stopTime = new Date().getTime();

		var previous = stage.current - 1;
		var presenter = stage.order[previous];

		// Set a new startTime based on the real spoken time so far
		if (presenter.stopTime) {
			var now = new Date().getTime();
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

		var stage = db.getStage(function (err, stage) {
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

		var next = stage.current + 1;
		var presenter = stage.order[next];

		// Set a new startTime based on the real spoken time so far or just use now if not spoken yet
		var now = new Date().getTime();
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

		var stage = db.getStage(function (err, stage) {
			if (err) {
				return callback(err);
			}

			if (stage && stage.current + 1 < stage.order.length) {

				var current = stage.order[stage.current];
				var talked = new Date().getTime() - current.startTime;
				return db.addStatistics(current, talked, function (err) {
					if (err) {
						return callback(err);
					}

					// Next
					return gotoNext(stage, callback);
				});
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
		var current = stage.order[stage.current];
		var talked = new Date().getTime() - current.startTime;
		if (talked > 5000) {
			db.addStatistics(current, talked, function (err) {
				if (err) {
					return callback(err);
				}

				// Stop
				return reset(function (err) {
					if (err) {
						return callback(err);
					}

					return callback(null, true);
				});

			});
		} else {

			// Stop
			return reset(function (err) {
				if (err) {
					return callback(err);
				}

				return callback(null, true);
			});
		}
	});
}

exports.goto = function (idx, callback) {
	function goto(stage, idx, c) {

		// Always set the current time as "stop" time for the current presenter before moving on
		stage.order[stage.current].stopTime = new Date().getTime();

		var next = Math.max(0, Math.min(idx, stage.order.length - 1));
		var presenter = stage.order[next];

		// Set a new startTime based on the real spoken time so far or just use now if not spoken yet
		var now = new Date().getTime();
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

		var stage = db.getStage(function (err, stage) {
			if (err) {
				return callback(err);
			}

			if (stage && stage.current !== idx) {

				var current = stage.order[stage.current];
				var talked = new Date().getTime() - current.startTime;
				return db.addStatistics(current, talked, function (err) {
					if (err) {
						return callback(err);
					}

					// Next
					return goto(stage, idx, callback);
				});
			}

			return callback(new Error("Already at the end"));
		});
	});
}

exports.toggleDiscussionSlot = function (idx, callback) {
	function toggleDiscussionSlot(stage, idx, c) {

		idx = Math.max(0, Math.min(idx, stage.order.length - 1));
		if (stage.order[idx].discussionSlot) {
			delete stage.order[idx].discussionSlot;
		} else {
			stage.order[idx].discussionSlot = true;
		}

		return db.setStage(-1, stage.order, c);
	}

	db.isRunning(function (err, isRunning) {
		if (err) {
			return callback(err);
		}

		if (isRunning) {
			return callback(new Error("Cannot toggle discussion slot on a running standup"));
		}

		db.getStage(function (err, stage) {
			if (err) {
				return callback(err);
			}

			if (stage) {
				// Toggle
				return toggleDiscussionSlot(stage, idx, callback);
			}

			return callback(new Error("Already at the end"));
		});
	});
}