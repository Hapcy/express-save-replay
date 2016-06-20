const express = require("express");
const proxy = require("express-http-proxy");
const fs = require("fs");
const url = require("url");

const app = express();
const originalSource = process.argv[2];
const subPath = process.argv[3];

var timeStampedDirs = {};
const key = "almafa";

const subdir = fs.stat(subPath, function(err,stat){
        if(err || !stat.isDirectory()){
            fs.mkdirSync(subPath);
        }
    }
);

app.use("/", proxy(originalSource, {
    forwardPath: function(req,res){
        return url.parse(req.url).path;
    },
    intercept: function(rsp, data, req, res, callback){
        var aUrl = url.parse(req.url);
        var writeFile = function(dest){
            var splittedDestination = dest.split("/");
            var possibleTimeStamp = parseInt(splittedDestination[splittedDestination.length-1]);
            var checker = new Date(possibleTimeStamp);
            if(checker.getTime() === possibleTimeStamp){
                splittedDestination.splice(-1);
                var dirname = splittedDestination.join("/");
                if(!timeStampedDirs[dirname]){
                    timeStampedDirs[dirname] = 0;
                }
                ++timeStampedDirs[dirname];
                var filename = timeStampedDirs[dirname] + key;
                filename = new Buffer(filename).toString('base64');
                splittedDestination.push(filename);
                dest = splittedDestination.join("/");
            }
            fs.writeFile(dest + ".data", data,function(){});
        };
        var createDir = function(subPaths, acc){
            if(subPaths.length === 1){
                acc += "/" + subPaths.shift();
                writeFile(acc);
            }else if(subPaths.length === 0){
                acc += "/__root";
                writeFile(acc);
            }else{
                acc += "/" + subPaths.shift();
                fs.stat(acc, function(err,stat){
                    if(err || !stat.isDirectory()){
                        fs.mkdir(acc,function(){
                            createDir(subPaths,acc);
                        });
                    }else{
                        createDir(subPaths,acc);
                    }
                });
            }
        };
        var tokenizedUrl = aUrl.path.split("/");
        tokenizedUrl.shift();
        createDir(tokenizedUrl,subPath);
		    res.setHeader('Access-Control-Allow-Origin', '*');
        callback(null, data);
    }
}));

app.listen(3000, function(){
    console.log("App is recording traffic to " + originalSource);
});
