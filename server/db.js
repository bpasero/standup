
'use strict';

var dirty = require('dirty');

var DEFAULT_DB_LOCATION = 'server/data/user.db';
var db = {
	get: function() {
		throw new Error('Call startup() first');
	}
}

// DB Startup routine
module.exports.startup = function(callback, dblocation) {
	dblocation = dblocation || DEFAULT_DB_LOCATION;
	db = dirty(dblocation);

	var done = false;

	db.on('load', function() {

		// add presets for first time db load
		if (!db.get('users')) {
			
			// users
			db.set('users', [
				{ name: 'Martin' },
				{ name: 'Isidor' },
				{ name: 'Joh' },
				{ name: 'André' },
				{ name: 'João' },
				{ name: 'Ben' },
				{ name: 'Alex' },
				{ name: 'Erich' },
				{ name: 'Dirk' },
				{ name: 'Redmond' }
			]);
		} else {
			callback(false);
		}
	});

	db.on('drain', function() {
		if (!done) {
			callback(true);
			done = true;
		}
	});
};

// Get users
module.exports.getUsers = function() {
	return db.get('users');
};

// Get status
module.exports.getStatus = function() {
	var users = db.get('users');
	var stage = db.get('stage');
	
	return {
		users: users,
		stage: stage	
	};
};

// Get stage
module.exports.getStage = function() {
	return db.get('stage');
};

// Set stage
module.exports.setStage = function(current, order) {
	db.set('stage', {
		current: current,
		order: order
	});
};

// Clear stage
module.exports.clearStage = function() {
	db.set('stage', null);
};

// IsRunning
module.exports.isRunning = function() {
	var stage = db.get('stage');
	
	return !!stage;
}