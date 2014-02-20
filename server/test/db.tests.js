'use strinct';

var assert = require('assert');
var fs = require('fs');

var db = require('../db');
var standup = require('../standup');

describe('Standup', function() {
	describe('#getStage()', function() {
		it('should return a default stage after startup', function(done) {
			db.startup(function() {
				standup.init(function() {
					db.getStage(function(err, stage) {
						fs.unlinkSync('test.db');
						assert.ok(stage.order.length > 0);
						done();
					});
				});
			}, 'test.db');
		});
	});
});