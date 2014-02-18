
'use strict';

var express = require('express');
var http = require('http');
var path = require('path');

var routes = require('./routes');
var db = require('./db');

// all environments
var app = express();
app.set('port', process.env.PORT);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/', routes.index);

// db
db.startup(function(created) {
  if (created) {
    console.log('Created a new database file');
  } else {
    console.log('Connected to existing database file');
  }

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
});