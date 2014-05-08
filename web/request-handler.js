var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var urlParser = require('url');
var querystring = require('querystring');
// require more modules/folders here!

var response404 = function(res){
  res.writeHead(404);
  res.end('NOT FOUND');
};

var responseHTML = function(res, htmlFile){
  fs.readFile(path.resolve(__dirname,'public', htmlFile), function(error, content) {
    if (error) {
      response404(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
};

var redirectTo = function(res, url, status){
  res.writeHead(status, {
    'Location': url
  });
  res.end();
};

exports.handleRequest = function (req, res) {

  var pathname = urlParser.parse(req.url).pathname.split('/');

  if(req.method === 'GET'){

    if(pathname[1] === 'page'){

      var url = pathname.slice(2).join('/');

      archive.getArchivedSite(url, function(filePath){
        if(filePath){
          responseHTML(res, filePath);
        } else {
          redirectTo(res, 'http://127.0.0.1:8080/loading', 301);
        }
      });

    } else {
      var htmlFile = 'index.html';

      if(pathname[1] === 'loading'){
        htmlFile = 'loading.html';
      }
      responseHTML(res, htmlFile);
    }

  } else if (req.method === 'POST'){
    // get data url
    var data = '';

    req.on('data', function(chunk) {
      data += chunk.toString();
    });


    req.on('end', function(){

      var url = querystring.parse(data).url;

      console.log(url);

      archive.getArchivedSite(url, function(archivedPath){
        console.log(archivedPath);
        if(archivedPath){
          // redirect to page archived url
          console.log('LOAD PAGE');
          redirectTo(res, 'http://127.0.0.1:8080/page/' + url, 200);
        } else {
          console.log('WRITE TO FILE');
          // write to sites.txt
          archive.addUrlToList(url);
          // redirect to loading
          redirectTo(res, 'http://127.0.0.1:8080/loading', 301);
        }
      });
    });

  } else {
    response404(res);
  }

  // res.end(archive.paths.list);
};

