const express = require("express");
const fs = require("fs");
const url = require("url");


const app = express();
const subPath = process.argv[2];
const maxRetries = process.argv[3] ? process.argv[3]-1 : null;

var timeStampedDirs = {};
var currentRetries = 0;
const key = "almafa";

app.use("/",function(req,res){
     var aUrl = url.parse(req.url).path;
     var splittedDestination = aUrl.split("/");
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
        aUrl = splittedDestination.join("/");
     }
     if(aUrl.length <= 1){
         aUrl = "/__root";
     }
     const path = subPath + aUrl + ".data";
	   res.setHeader('Access-Control-Allow-Origin', '*');
     fs.readFile(path, function(err,data){
        if( err ){
            if(maxRetries === null){
                console.log("Number of retries was not specified. Exiting with default no retries.");
                appInstance.close();
                process.exit(0);
            }else{
                ++currentRetries;
                if(currentRetries > maxRetries){
                    console.log("Number of retries was reached. Restarting.");
                    currentRetries = 0;
                    timeStampedDirs = {};
                }
                res.status(429).send("See more about this error at: https://http.cat/429");
            }
        } else {
          res.json(JSON.parse(data.toString('utf-8')));
        }
     });
});

const appInstance = app.listen(3000, function(){
    console.log("App is replaying traffic of " + subPath);
});
