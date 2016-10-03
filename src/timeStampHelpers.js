module.exports = (function IIFE() {
  function UrlLastPartTimestamp() {
    this.reset();
  }
  UrlLastPartTimestamp.prototype.modifyPath = function modifyPath(urlPath) {
    const splittedLocation = urlPath.path.split('/');
    const tmp = splittedLocation.slice(0);
    const possibleTimeStamp = tmp.pop();
    if ((/^[0-9]*$/).test(possibleTimeStamp)) {
      const dirname = tmp.join('/');
      if (!this.timeStampedDirs[dirname]) {
        this.timeStampedDirs[dirname] = 0;
      }
      this.timeStampedDirs[dirname] += 1;
      tmp.push(this.timeStampedDirs[dirname]);
    } else {
      tmp.push(possibleTimeStamp);
    }
    const newUrlObj = Object.assign({}, urlPath);
    newUrlObj.path = tmp.join('/');
    return newUrlObj;
  };
  UrlLastPartTimestamp.prototype.reset = function reset() {
    this.timeStampedDirs = {};
  };
  return UrlLastPartTimestamp;
}());
