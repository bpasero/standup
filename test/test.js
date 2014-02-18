'use strinct';

var assert = require('assert');
var fs = require('fs');

var db = require('../db');

describe('DB', function() {
  describe('#getUsers()', function() {
    it('should return a default set of users after startup', function(done) {
      db.startup('test.db', function() {
        db.getUsers(function(users) {
          fs.unlinkSync('test.db');
          assert.equal(3, users.length);
          done();
        });
      });
    });
  });
});