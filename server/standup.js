
'use strict';

var fs = require('fs');
var path = require('path');

var db = require('./db');
var utils = require('./utils');
var config = require('../config');

module.exports.init = function(callback) {
	db.needsReinit(function(err, needsReinit) {
		if (err) {
			return callback(err);
		}
		
		if (needsReinit) {
			db.reinit(function(err) {
				if (err) {
					return callback(err);
				}
				
				return module.exports.shuffle(function(err) {
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

module.exports.shuffle = function(callback) {
	var users = config.users;
	var order = utils.shuffleArray(utils.clone(users));
	
	// Boss is always last
	order.push({
		name: 'Erich Team Lead'	
	});
	
	return db.setStage(-1, order, callback);
};

module.exports.start = function(callback) {
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

module.exports.next = function(callback) {
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
				var next = stage.current + 1;
				var presenter = stage.order[next];
				presenter.time = new Date().getTime();
			
				return db.setStage(next, stage.order, callback);
			}
			
			return callback(new Error("Already at the end"));
		});
	});
}

module.exports.stop = function(callback) {
	db.getStage(function(err, stage) {
		if (err) {
			return callback(err);
		}
		
		return db.setStage(-1, stage.order, callback);
	});
}