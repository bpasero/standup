
'use strict';

var db = require('./db');

module.exports.start = function() {
	if (db.isRunning()) {
		throw new Error("Cannot start a running standup");
	}
	
	var users = db.getUsers();
	var order = shuffleArray(users);
	
	db.setStage(0, order);
}

module.exports.next = function() {
	if (!db.isRunning()) {
		throw new Error("Cannot next on a not running standup");
	}
	
	var stage = db.getStage();
	if (stage && stage.current < stage.order.length) {
		db.setStage(stage.current + 1, stage.order);
	} else {
		throw new Error("Already at the end");
	}
}

module.exports.stop = function() {
	db.clearStage();
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