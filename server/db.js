
'use strict';

var fs = require('fs');

var DEFAULT_DB_LOCATION = 'server/db.json';
var db;

function createDb(path, callback) {
	function loadDb(clb) {
		fs.exists(path, function(exists) {
			if (exists) {
				fs.readFile(path, function(err, val) {
					if (err) {
						return clb(err);
					}
					
					return clb(null, JSON.parse(val));
				});
			} else {
				fs.writeFile(path, JSON.stringify({}), function(err) {
					if (err) {
						return clb(err);
					}
					
					return clb(null, {});
				});
			}
		});
	}
	
	loadDb(function(err, contents) {
		if (err) {
			return callback(err);
		}
		
		callback(null, {
			get: function(key, c) {
				c(null, contents[key]);
			},
			
			set: function(key, value, c) {
				contents[key] = value;
				fs.writeFile(path, JSON.stringify(contents, null, '  '), c);
			},
			
			del: function(key, c) {
				delete contents[key];
				fs.writeFile(path, JSON.stringify(contents, null, '  '), c);
			}
		});
	});
}

// DB Startup routine
module.exports.startup = function(callback, dblocation) {
	dblocation = dblocation || DEFAULT_DB_LOCATION;
	createDb(dblocation, function(err, jsonDb) {
		if (err) {
			return callback(err);
		}
		
		db = jsonDb;
		
		return callback(null);
	});
};

// Get stage
module.exports.getStage = function(callback) {
	return db.get('stage', callback);
};

// Set stage
module.exports.setStage = function(current, order, callback) {
	return db.set('stage', {
		current: current,
		order: order
	}, callback);	
};

// Clear stage
module.exports.clearStage = function(callback) {
	return db.del('stage', callback);
};

// IsRunning
module.exports.isRunning = function(callback) {
	var stage = db.get('stage', function(err, stage) {
		return callback(err, stage && stage.current >= 0);
	});
}