const express = require("express");
const fs = require("fs");
const url = require("url");


const app = express();
const subPath = process.argv[2];

var timeStampedDirs = {};
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
     fs.readFile(path, function(err,data){
        res.json(JSON.parse(data.toString('utf-8'))); 
     });
});

app.listen(3000, function(){
    console.log("App is replaying traffic of " + subPath); 
});