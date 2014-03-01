
'use strict';

var fs = require('fs');
var path = require('path');

var db = require('./db');
var utils = require('./utils');
var config = require('../config');

exports.init = function(callback) {
	db.needsReinit(function(err, needsReinit) {
		if (err) {
			return callback(err);
		}
		
		if (needsReinit) {
			db.reinit(function(err) {
				if (err) {
					return callback(err);
				}
				
				return exports.shuffle(function(err) {
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

exports.shuffle = function(callback) {
	var users = config.users;
	var order = utils.shuffleArray(utils.clone(users));
	
	// Boss is always last
//	order.push({
//		name: 'Erich Team Lead'	
//	});
	
	return db.setStage(-1, order, callback);
};

exports.start = function(callback) {
	db.isRunning(function(err, isRunning) {
		if (err) {
			return callback(err);
		}
			
		if (isRunning) {
			return callback(new Error("Cannot start a running standup"));
		}
		
		db.getStage(function(err, stage) {
			if (err) {
				return callback(err);
			}
			
			var presenter = stage.order[0];
			presenter.time = new Date().getTime();
			
			return db.setStage(0, stage.order, callback);
		});
	});
}

exports.next = function(callback) {
	function gotoNext(stage, c) {
		var next = stage.current + 1;
		var presenter = stage.order[next];
		presenter.time = new Date().getTime();
	
		return db.setStage(next, stage.order, c);
	}
				
	db.isRunning(function(err, isRunning) {
		if (err) {
			return callback(err);
		}
		
		if (!isRunning) {
			return callback(new Error("Cannot next on a not running standup"));
		}
		
		var stage = db.getStage(function(err, stage) {
			if (err) {
				return callback(err);
			}
			
			if (stage && stage.current + 1 < stage.order.length) {
				
				// Statistics (only if speaker did not get skipped by checking for 3 seconds talk time)
				var current = stage.order[stage.current];
				var talked = new Date().getTime() - current.time;
				if (talked > 3000) {
					return db.addStatistics(current, talked, function(err) {
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

exports.stop = function(callback) {
	db.getStage(function(err, stage) {
		if (err) {
			return callback(err);
		}
		
		// Statistics (only if speaker did not get skipped by checking for 3 seconds talk time)
		var current = stage.order[stage.current];
		var talked = new Date().getTime() - current.time;
		if (talked > 3000) {
			db.addStatistics(current, talked, function(err) {
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