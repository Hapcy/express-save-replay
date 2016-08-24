const specialCodes = [
	{
		character: '\\',
		charRegex: /\\/,
		code: '---5C---',
		codeRegex: /---5C---/,
	},
	/*{
		character: '/',
		charRegex: /\//,
		code: '---2F---',
		codeRegex: /---2F---/,
	},*/
	{
		character: ':',
		charRegex: /:/,
		code: '---3A---',
		codeRegex: /---3A---/,
	},
	{
		character: '*',
		charRegex: /\*/,
		code: '---2A---',
		codeRegex: /---2A---/,
	},
	{
		character: '?',
		charRegex: /\?/,
		code: '---3F---',
		codeRegex: /---3F---/,
	},
	{
		character: '"',
		charRegex: /"/,
		code: '---22---',
		codeRegex: /---22---/,
	},
	{
		character: '<',
		charRegex: /</,
		code: '---3C---',
		codeRegex: /---3C---/,
	},
	{
		character: '>',
		charRegex: />/,
		code: '---3E---',
		codeRegex: /---3E---/,
	},
	{
		character: '|',
		charRegex: /\|/,
		code: '---7C---',
		codeRegex: /---7C---/,
	},
];

function encodeSpecialCharacters(string) {
	return specialCodes.reduce(
		(memo, specialChar) => 
			memo.replace(specialChar.charRegex, specialChar.code),
		string
	);
}

function decodeSpecialCharacters(string) {
	return specialCodes.reduce(
		(memo, specialChar) => 
			memo.replace(specialChar.codeRegex, specialChar.character),
		string
	);
}

module.exports = {
	encodeSpecialCharacters,
	decodeSpecialCharacters
}