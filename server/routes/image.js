/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const http = require('http');

exports.route = function (req, res) {

  //The url we want is: 'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
  let options = {
    host: 'www.bing.com',
    path: '/HPImageArchive.aspx?format=js&idx=0&n=1'
  };

  let callback = function (response) {
    let str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      try {
        let data = JSON.parse(str);
        let url = data.images[0].url;
        let label = data.images[0].copyright;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          url: 'http://www.bing.com' + url,
          label: label
        }));
      } catch (error) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({}));
      }
    });
  }

  http.request(options, callback).end();
};