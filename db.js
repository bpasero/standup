
'use strict';

var dirty = require('dirty');

var DEFAULT_DB_LOCATION = 'data/user.db';
var db = {
	get: function() {
		throw new Error('Call startup first');
	}
}

// DB Startup routine
module.exports.startup = function(dblocation, callback) {
	dblocation = dblocation || DEFAULT_DB_LOCATION;
	db = dirty(dblocation);
	
	var done = false;
	
	db.on('load', function() {
		
		// add some predefined users unless already done
		if (!db.get('users')) {
			var users = [
				{name: 'Benjamin Pasero'},
				{name: 'Joao Moreno'},
				{name: 'Isidor Nikolic'}
			]
			
			db.set('users', users);
		}
	});
	
	db.on('drain', function() {
		if (!done) {
    		callback();
			done = true;
		}
  	});
}

// Get users
module.exports.getUsers = function(callback) {
	callback(db.get('users'));
}