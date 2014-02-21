
'use strict';

var path = require('path');

exports.route = function(req, res) {
  res.sendfile(path.join(__dirname, '..', 'view', 'index.html'));
};