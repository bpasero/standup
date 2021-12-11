/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

exports.shuffleArray = function (array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

exports.clone = function (obj) {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	let result = (Array.isArray(obj)) ? [] : {};
	Object.keys(obj).forEach(function (key) {
		if (obj[key] && typeof obj[key] === 'object') {
			result[key] = exports.shuffleArray(obj[key]);
		} else {
			result[key] = obj[key];
		}
	});

	return result;
}