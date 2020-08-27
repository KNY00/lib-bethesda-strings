const BufferOperations = require('../../src/BufferOperations.js');
const ArrayOperations = require('../../src/ArrayOperations.js');

class CombineFiles {
	constructor(secondFileArray, extension) {
		this.secondFileArray = secondFileArray;
		this.extension = extension;
		this.entries = this.getEntries();
	}

	getEntries() {
		let cl = new BufferOperations(this.secondFileArray, this.extension);
		return cl.getEntries();
	}

	modification = (stringArray, element) => {
		// Remove nullPoint at the end of the array
		// We don't need it because we're gonna use the one that the other file contains
		// If we keep, it's gonna break the interpretation of the string
		// Bad stringArray sequence example: [0x25, 0x00, 0x25]
		// nullPoint 0x00 must be at the end of the returned array
		// only "one" nullPoint per returned array
		stringArray.pop();

		for (let index = 0; index < this.entries.length ; index++) {
			const GermanObjectRow = this.entries[index];

			if (element.id === GermanObjectRow.id) {
				// We remove the first 4 bytes (length of string in Uint32)
				// The class is gonna calculate the length (append uint32 array before the string)
				// of the new string that this function will return
				let arrayGErmanString = [...GermanObjectRow.stringArray.slice(4)];


				// condition is necessary if a file contains only an endpoint 0x00
				// in this case we will have 0x0A 0x00 which is useless (line break, then nothing)
				if (arrayGErmanString.length !== 1 && arrayGErmanString[0] !== 0) {
					// we add line break before the array representing the second language
					// to separate both languages
					arrayGErmanString.unshift(0x0A);
				}

				return ArrayOperations.concatArrays(stringArray, arrayGErmanString);
			}
		}
	}
}

module.exports = CombineFiles;