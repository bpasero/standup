/// <reference path="./declare/jquery.d.ts" />

define([
	'io'
], function(io) {
		'use strict';

		io.ioConnect(function(status) {
			console.log(status);
			$('#main').text(status);	
		});
});