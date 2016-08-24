const key = ['almafa', 'porkolt'];

function hasTimeStamp(probableTimeStampString) {
	const helperString = probableTimeStampString.split().reverse().join();
	const reversedTimestampString = helperString.match(/^([0-9]*).*/)[1];
	const timestampString = reversedTimestampString.split().reverse().join();
	const possibleTimeStamp = parseInt(timestampString);
	const checker = new Date(possibleTimeStamp);
	return checker.getTime() === possibleTimeStamp;
}
function createTimeStampedFileLoc(splittedLocation, timeStampedDirs) {
	var tmp = splittedLocation.slice(0);
	const timestamp = tmp.pop();
	const dirname = tmp.join('/');
	if(!timeStampedDirs[dirname]){
		timeStampedDirs[dirname] = 0;
	}
	++timeStampedDirs[dirname];
	var filename = key[0] + timeStampedDirs[dirname] + key[1];
	filename = new Buffer(filename).toString('base64');
	tmp.push(filename);
	return tmp.join('/');
}
module.exports = {
	hasTimeStamp,
	createTimeStampedFileLoc
};
