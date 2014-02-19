
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
			
			// runtime
			db.set('runtime', {
				current: null,
				running: false
			});
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

// Get status
module.exports.getStatus = function(callback) {
	var users = db.get('users');
	var runtime = db.get('runtime');
	
	callback({
		users: users,
		runtime: runtime	
	});
};

// Start
module.exports.start = function(callback) {
	db.set('runtime', {
		current: null,
		running: true
	});
	
	callback();
};