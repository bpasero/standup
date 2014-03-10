
'use strict';

var http = require('http');

exports.route = function(req, res) {

  //The url we want is: 'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
  var options = {
    host: 'www.bing.com',
    path: '/HPImageArchive.aspx?format=js&idx=0&n=1'
  };

  var callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function(chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function() {
      try {
        var data = JSON.parse(str);
        var url = data.images[0].url;
        var label = data.images[0].copyright;
        
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
          url: 'http://www.bing.com' + url,
          label: label
        }));
      } catch (error) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({}));
      }
    });
  }

  http.request(options, callback).end();
};