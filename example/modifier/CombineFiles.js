const BufferOperations = require('../../src/BufferOperations.js');
const ArrayOperations = require('../../src/array-operations');

class CombineFiles {
    constructor(secondFileArray, extension) {
        this.secondFileArray = secondFileArray;
        this.extension = extension;
        this.entries = this.getEntries();
    }

    getEntries() {
        const cl = new BufferOperations(this.secondFileArray, this.extension);
        return cl.getEntries();
    }

    modification = (stringArray, element) => {
        // Remove null terminator at the end of the array
        // We don't need it because we're gonna use the one that the other file contains
        // If we keep, it's gonna break the interpretation of the string
        // Bad stringArray sequence example: [0x25, 0x00, 0x25]
        // null terminator 0x00 must be at the end of the returned array
        // only "one" null terminator per returned array
        stringArray.pop();

        for (let index = 0; index < this.entries.length; index += 1) {
            const entry = this.entries[index];

            if (element.id === entry.id) {
                // We remove the first 4 bytes (length of string in Uint32)
                // The class is gonna calculate the length (append uint32 array before the string)
                // of the new string that this function will return
                let entryStringArrayWithNoLengthSequence = entry.stringArray.slice(4);

                // condition is necessary if a file contains only an endpoint 0x00
                // in this case we will have 0x0A 0x00 which is useless (line break, then nothing)
                if (
                    entryStringArrayWithNoLengthSequence.length !== 1 &&
                    entryStringArrayWithNoLengthSequence[0] !== 0
                ) {
                    // we add line break before the array representing the second language
                    // to separate both languages
                    entryStringArrayWithNoLengthSequence = ArrayOperations.concatArrays(
                        Uint8Array.from([0x0a]),
                        entryStringArrayWithNoLengthSequence)
                }

                return ArrayOperations.concatArrays(
                    stringArray,
                    entryStringArrayWithNoLengthSequence
                );
            }
        }
    }
}

module.exports = CombineFiles;
