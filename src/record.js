const proxy = require('express-http-proxy');
const fs = require('fs');
const url = require('url');

const { encodeSpecialCharacters } = require('./specialCharacterConverter');
const { decodeDataWith } = require('./encodingHelper');

function writeFile({ dest, data, rsp, shouldCreateReadableData }, callback = () => {}) {
  function realWriteFile({ dataWritable, fileLoc }) {
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
    realWriteFile({ dataWritable: data, fileLoc });
  } else {
    decodeDataWith({
      data,
      contentEncodingHeader: rsp.headers['content-encoding'],
    }, realWriteFile);
  }
}


function createDir({ subPaths, accumulator }, callback = () => {}) {
  let newAccumulator = '';
  if (subPaths.length === 1) {
    const newPart = subPaths.shift();
    if (newPart === '') {
      newAccumulator = `${accumulator}/__root`;
      callback(newAccumulator);
    } else {
      newAccumulator = `${accumulator}/${newPart}`;
      callback(newAccumulator);
    }
  } else {
    newAccumulator = `${accumulator}/${subPaths.shift()}`;
    fs.stat(newAccumulator, (statErr, stat) => {
      if (statErr) {
        fs.mkdir(newAccumulator, (mkdirErr) => {
          if (mkdirErr) {
            console.error(`Failed to create directory ${newAccumulator}`);
          } else {
            createDir({ subPaths, accumulator: newAccumulator }, callback);
          }
        });
      } else if (!stat.isDirectory()) {
        console.error(`File at ${newAccumulator} already exists. Failed to create directory.`);
      } else {
        createDir({ subPaths, accumulator: newAccumulator }, callback);
      }
    });
  }
}

module.exports = function IIFE({
  remoteUrl,
  baseDirForUrl,
  timeStampExtractor = {
    modifyPath: oldUrl => oldUrl,
  },
  shouldCreateReadableData,
  prevent304 = true,
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
    decorateRequest(proxyReq, originalReq) {
      let retReq;
      if (prevent304) {
        retReq = proxyReq;
        retReq.headers['if-none-match'] = 'no-match-for-this';
      } else {
        retReq = originalReq;
      }
      return retReq;
    },
    forwardPath(req) {
      return url.parse(req.url).path;
    },
    intercept(rsp, data, req, res, callback) {
      const aUrl = timeStampExtractor.modifyPath(url.parse(req.url));
      const tokenizedUrl = aUrl.path.split('/');
      tokenizedUrl.shift();
      createDir({
        subPaths: tokenizedUrl,
        accumulator: `./${baseDirForUrl}`,
      }, filePath => writeFile({
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
    },
  });
};
