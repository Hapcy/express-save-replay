const fs = require('fs');
const url = require('url');

const { encodeSpecialCharacters } = require('./specialCharacterConverter');
const { encodeDataWith } = require('./encodingHelper');

module.exports = function IIFE({
  maxRetries,
  baseDirForUrl,
  timeStampExtractor = {
    modifyPath: oldUrl => oldUrl,
    reset: () => {},
  },
  shouldCreateReadableData,
}) {
  let currentRetries = 0;
  return function replayer(req, res) {
    const aUrlPath = timeStampExtractor.modifyPath(url.parse(req.url).path);
    let fileLoc = aUrlPath;
    if (fileLoc.length <= 1) {
      fileLoc = '/__root';
    }
    const path = `./${baseDirForUrl}${fileLoc}.data`;
    res.setHeader('Access-Control-Allow-Origin', '*');
    fs.readFile(encodeSpecialCharacters(path), (err, data) => {
      if (err) {
        console.log(err);
        if (!maxRetries && maxRetries !== 0) {
          console.log(`Number of retries was not specified. Aborting request to ${path}`);
          res.status(404).send('See more about this error at: https://http.cat/404');
        } else {
          currentRetries += 1;
          if (currentRetries > maxRetries) {
            console.log('Number of retries was reached. Restarting.');
            currentRetries = 0;
          }
          res.status(429).send('See more about this error at: https://http.cat/429');
        }
      } else {
        const filedata = JSON.parse(data);
        const sendMessage = (readData) => {
          res.status(filedata.status).set(filedata.headers).send(readData);
        };
        if (!shouldCreateReadableData) {
          sendMessage(Buffer.from(filedata.data));
        } else {
          encodeDataWith({ data: filedata.data, contentEncodingHeader: filedata.headers['content-encoding'] }, sendMessage);
        }
      }
    });
  };
};
