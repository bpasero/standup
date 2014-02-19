
'use strict';

var db = require('./db');

function start() {
	if (db.isRunning()) {
		throw new Error("Cannot start a running standup");
	}
	
	var users = db.getUsers();
	var shuffled = shuffleArray(users);
	
	db.setRuntime(shuffled[0], shuffled);
	
	return db.getStatus();
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

exports.start = start;