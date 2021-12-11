/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const http = require('http');
const path = require('path');

const express = require('express');

const index = require('./routes/index');
const image = require('./routes/image');
const db = require('./db');
const io = require('./io');
const standup = require('./standup');

// all environments
let app = express();
app.set('port', process.env.PORT);
app.use(express.favicon());
//app.use(express.logger('default'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'client')));

// routes
app.get('/', index.route);
app.get('/image', image.route);

// db
db.startup(function (error, created) {
	if (error) {
		console.error('error: ' + error.toString());
	} else if (created) {
		console.log('Created new DB');
	} else {
		console.log('Connected to existing DB');
	}

	// initial data
	standup.init(function (error, reinit) {
		if (error) {
			console.error('error: ' + error.toString());
		} else if (reinit) {
			console.log('Reshuffled stage');
		}

		// server & socket.io
		let server = http.createServer(app);
		io.connect(server);

		// listen
		server.listen(app.get('port'), function () {
			console.log('info: Express server listening on port ' + app.get('port'));
		});
	});
});