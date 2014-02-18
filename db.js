
'use strict';

var dirty = require('dirty');

var DEFAULT_DB_LOCATION = 'data/user.db';
var db = {
	get: function() {
		throw new Error('Call startup first');
	}
}

// DB Startup routine
module.exports.startup = function(callback, dblocation) {
	dblocation = dblocation || DEFAULT_DB_LOCATION;
	db = dirty(dblocation);

	var done = false;

	db.on('load', function() {

		// add some predefined users unless already done
		if (!db.get('users')) {
			var users = [
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
			]

			db.set('users', users);
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
}

// Get users
module.exports.getUsers = function(callback) {
	callback(db.get('users'));
}