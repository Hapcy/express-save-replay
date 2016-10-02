const proxy = require('express-http-proxy');
const fs = require('fs');
const url = require('url');

const { encodeSpecialCharacters } = require('./specialCharacterConverter');
const { decodeDataWith } = require('./encodingHelper');

function writeFile({ dest, data, rsp, shouldCreateReadableData }, callback = ()=>{}){
  function realWriteFile(dataWritable) {
    fs.writeFile(encodeSpecialCharacters(fileLoc), JSON.stringify({
      data: dataWritable,
      status: rsp.statusCode,
      headers: rsp.headers,
    }), (err) => {
      if (err) {
        console.error(`Failed to write to file at ${dest}: ${err}`);
      } else {
        callback();
      }
    });
  }
  const fileLoc = `${dest}.data`;
  if (!shouldCreateReadableData) {
    realWriteFile(data);
  } else {
    decodeDataWith({
      data,
      contentEncodingHeader: rsp.headers['content-encoding'],
    }, realWriteFile);
  }
}


function createDir({ subPaths, accumulator }, callback = ()=>{}) {
  if (subPaths.length === 1) {
    const newPart = subPaths.shift();
    if (newPart === '') {
      accumulator += '/__root';
      callback(accumulator);
    } else {
      accumulator += '/' + newPart;
      callback(accumulator);
    }
  } else {
    accumulator += '/' + subPaths.shift();
    fs.stat(accumulator, function(err,stat){
      if (err) {
        fs.mkdir(accumulator, (err) => {
          if (err) {
            console.error(`Failed to create directory ${accumulator}`);
          } else {
            createDir({subPaths,accumulator}, callback);
          }
        });
      } else if (!stat.isDirectory()) {
        console.error(`File at ${accumulator} already exists. Failed to create directory.`);
      } else {
        createDir({subPaths,accumulator}, callback);
      }
    });
  }
}

module.exports = function({
  remoteUrl,
  baseDirForUrl,
  timeStampExtractor = {
    modifyPath: url => url,
  },
  shouldCreateReadableData,
}) {
  try {
    const baseDirStat = fs.statSync(baseDirForUrl);
    if (!baseDirStat.isDirectory()) {
      console.error(`File at ${baseDirForUrl} already exists. Failed to create directory.`);
    }
  } catch (e) {
    fs.mkdirSync(baseDirForUrl);
  }
  return proxy(remoteUrl, {
    forwardPath (req,res) {
      return url.parse(req.url).path;
    },
    intercept (rsp, data, req, res, callback) {
      const aUrl = timeStampExtractor.modifyPath(url.parse(req.url));
      let tokenizedUrl = aUrl.path.split('/');
      tokenizedUrl.shift();
      createDir({
        subPaths: tokenizedUrl,
        accumulator: `./${baseDirForUrl}`,
      }, (filePath) => writeFile({
          data,
          rsp,
          shouldCreateReadableData,
          dest: `${filePath}`,
        }, () => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            callback(null, data);
          }
        )
      );
    }
  });
};
