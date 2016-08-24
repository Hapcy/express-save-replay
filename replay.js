#!/usr/bin/env node
const express = require("express");
const fs = require("fs");
const url = require("url");

const { hasTimeStamp, createTimeStampedFileLoc } = require('./timeStampHelpers');
const { decodeSpecialCharacters } = require('./specialCharacterConverter');

const app = express();
const subPath = process.argv[2];
const maxRetries = process.argv[3] >= 0 ? process.argv[3] : null;

var timeStampedDirs = {};
var currentRetries = 0;

app.use("/",function(req,res){
	const aUrl = url.parse(req.url);
	const splittedDestination = aUrl.path.split("/");
	var fileLoc;
	if(hasTimeStamp(splittedDestination[splittedDestination.length-1])){
		fileLoc = createTimeStampedFileLoc(splittedDestination, timeStampedDirs);
	} else {
		fileLoc = aUrl.path;
	}
	if(fileLoc.length <= 1){
		fileLoc = "/__root";
	}
	const path = subPath + fileLoc + ".data";
	res.setHeader('Access-Control-Allow-Origin', '*');
	fs.readFile(decodeSpecialCharacters(path), function(err,data){
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
			const filedata = JSON.parse(data);
			res.status(filedata.status).set(filedata.headers).send(filedata.data);
		}
	});
});

const appInstance = app.listen(3000, function(){
    console.log("App is replaying traffic of " + subPath);
});
