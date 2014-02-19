
'use strict';

var db = require('./db');

module.exports.start = function(callback) {
	db.isRunning(function(err, isRunning) {
		if (err) {
			return callback(err);
		}
			
		if (isRunning) {
			return callback(new Error("Cannot start a running standup"));
		}
		
		var users = db.getUsers(function(err, users) {
			if (err) {
				return callback(err);
			}
			
			var order = shuffleArray(users);
			
			return db.setStage(0, order, callback);
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
				return db.setStage(stage.current + 1, stage.order, callback);
			}
			
			return callback(new Error("Already at the end"));
		});
	});
}

module.exports.stop = function(callback) {
	db.clearStage(callback);
}

function shuffleArray(array) {
	array = array.slice(0); // do not modify the original array
	
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	
    return array;
}