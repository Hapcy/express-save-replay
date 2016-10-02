#!/usr/bin/env node
const express = require('express');
const proxy = require('express-http-proxy');
const fs = require('fs');
const url = require('url');

const app = express();
const originalSource = process.argv[2];
const subPath = process.argv[3];

const { hasTimeStamp, createTimeStampedFileLoc } = require('./timeStampHelpers');
const { encodeSpecialCharacters } = require('./specialCharacterConverter');

var timeStampedDirs = {};

const subdir = fs.stat(subPath, function(err,stat){
  if(err || !stat.isDirectory()){
    fs.mkdirSync(subPath);
  }
}
);

app.use('/', proxy(originalSource, {
  forwardPath: function(req,res){
    return url.parse(req.url).path;
  },
  intercept: function(rsp, data, req, res, callback){
    function writeFile(dest){
      const splittedDestination = dest.split('/');
      var fileLoc;
      if(hasTimeStamp(splittedDestination[splittedDestination.length-1])){
        fileLoc = createTimeStampedFileLoc(splittedDestination, timeStampedDirs);
      } else {
        fileLoc = dest;
      }
      fileLoc += '.data';
      fs.writeFile(encodeSpecialCharacters(fileLoc), JSON.stringify({
        data: data.toString(),
        status: rsp.statusCode,
        headers: rsp.headers,
      }), ()=>{});
    }

    function createDir(subPaths, accumulator){
      if(subPaths.length === 2){
        accumulator += '/' + subPaths.shift();
        writeFile(accumulator);
      }else if(subPaths.length === 1){
        accumulator += '/__root';
        writeFile(accumulator);
      }else{
        accumulator += '/' + subPaths.shift();
        fs.stat(accumulator, function(err,stat){
          if(err || !stat.isDirectory()){
            fs.mkdir(accumulator, () => createDir(subPaths,accumulator));
          }else{
            createDir(subPaths,accumulator);
          }
        });
      }
    }

    const aUrl = url.parse(req.url);

    var tokenizedUrl = aUrl.path.split('/');

    tokenizedUrl.shift();

    createDir(tokenizedUrl,subPath);
    res.setHeader('Access-Control-Allow-Origin', '*');
    callback(null, data);
  }
}));

app.listen(3000, function(){
  console.log('App is recording traffic to ' + originalSource);
});
