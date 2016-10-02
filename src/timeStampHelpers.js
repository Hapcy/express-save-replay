module.exports = (function() {
	function UrlLastPartTimestamp() {
		this.reset();
	}
	UrlLastPartTimestamp.prototype.modifyPath = function(urlPath) {
		const splittedLocation = urlPath.split('/');
		let tmp = splittedLocation.slice(0);
		const possibleTimeStamp = tmp.pop();
		if ((/^[0-9]*$/).test(possibleTimeStamp)) {
			const dirname = tmp.join('/');
			if(!timeStampedDirs[dirname]){
				timeStampedDirs[dirname] = 0;
			}
			++timeStampedDirs[dirname];
			tmp.push(timeStampedDirs[dirname]);
		} else {
			tmp.push(possibleTimeStamp);
		}
		return tmp.join('/');
	};
	UrlLastPartTimestamp.prototype.reset = function() {
		this.timeStampedDirs = {};
	}
	return UrlLastPartTimestamp;
})();
