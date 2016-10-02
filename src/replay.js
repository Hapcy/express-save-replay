const fs = require('fs');
const url = require('url');

const { encodeSpecialCharacters } = require('./specialCharacterConverter');
const { encodeDataWith } = require('./encodingHelper');

module.exports = function({
  maxRetries,
  baseDirForUrl,
  timeStampExtractor = {
    modifyPath: url => url,
    reset: ()=>{},
  },
  shouldCreateReadableData,
}) {
  currentRetries = 0;
  return function(req,res){
    const aUrlPath = timeStampExtractor.modifyPath(url.parse(req.url).path);
    const splittedDestination = aUrlPath.split("/");
    let fileLoc = aUrlPath;
    if(fileLoc.length <= 1){
    	fileLoc = "/__root";
    }
    const path = `./${baseDirForUrl}${fileLoc}.data`;
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.readFile(encodeSpecialCharacters(path), function(err,data){
      if( err ){
        console.log(err);
        if(!maxRetries && maxRetries !== 0){
          console.log(`Number of retries was not specified. Aborting request to ${path}`);
          res.status(404).send("See more about this error at: https://http.cat/404");
        }else{
          ++currentRetries;
          if(currentRetries > maxRetries){
            console.log("Number of retries was reached. Restarting.");
            currentRetries = 0;
          }
          res.status(429).send("See more about this error at: https://http.cat/429");
        }
      } else {
        const filedata = JSON.parse(data);
        const sendMessage = (data) => {
          res.status(filedata.status).set(filedata.headers).send(data);
        };
        if (!shouldCreateReadableData) {
          sendMessage(Buffer.from(filedata.data));
        } else {
          encodeDataWith({ data: filedata.data, contentEncodingHeader: filedata.headers['content-encoding'] }, sendMessage);
        }

      }
    });
  }
}
