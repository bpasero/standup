/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

var path = require('path');

exports.route = function(req, res) {
  res.sendfile(path.join(__dirname, '..', 'view', 'index.html'));
};