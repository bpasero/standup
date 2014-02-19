
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
			
			var order = shuffleArray(clone(users));
			
			// Boss is always last
			order.push({
				name: 'Erich Team Lead'	
			});
			
			var presenter = order[0];
			presenter.time = new Date().getTime();
			
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
	db.clearStage(callback);
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
	
    return array;
}

function clone(obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}
	
	var result = (Array.isArray(obj)) ? [] : {};
	Object.keys(obj).forEach(function(key) {
		if (obj[key] && typeof obj[key] === 'object') {
			result[key] = clone(obj[key]);
		} else {
			result[key] = obj[key];
		}
	});
	
	return result;
}