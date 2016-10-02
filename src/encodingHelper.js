const zlib = require('zlib');

function encodeDataWith({ data, contentEncodingHeader }, callback) {
  if (contentEncodingHeader) {
    if (contentEncodingHeader === 'gzip') {
      zlib.gzip(Buffer.from(data), (err, result) => {
        callback(result);
      });
    } else if (contentEncodingHeader === 'deflate') {
      zlib.deflate(Buffer.from(data), (err, result) => {
        callback(result);
      });
    } else {
      console.error(`Unknown Content-Encoding: ${contentEncodingHeader}`);
    }
  } else {
    callback(Buffer.from(data));
  }
}

function decodeDataWith({ data, contentEncodingHeader }, callback) {
  if (contentEncodingHeader) {
    if (contentEncodingHeader === 'gzip') {
      zlib.gunzip(Buffer.from(data), (err, result) => {
        callback(result.toString());
      });
    } else if (contentEncodingHeader === 'deflate') {
      zlib.inflate(Buffer.from(data), (err, result) => {
        callback(result.toString());
      });
    } else {
      console.error(`Unknown Content-Encoding: ${contentEncodingHeader}`);
    }
  } else {
    callback(data.toString());
  }
}

module.exports = {
  encodeDataWith,
  decodeDataWith,
};
