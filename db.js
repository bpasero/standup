
'use strict';

var dirty = require('dirty');
var db = dirty('data/user.db');

// DB Startup routine
module.exports.startup = function(callback) {
	var done = false;
	
	db.on('load', function() {
		
		// add some predefined users
		db.set('bpasero', {name: 'Benjamin Pasero'});
		db.set('jmoreno', {name: 'Joao Moreno'});
		db.set('inikolic', {name: 'Isidor Nikolic'});
	});
	
	db.on('drain', function() {
		if (!done) {
    		callback();
			done = true;
		}
  	});
}