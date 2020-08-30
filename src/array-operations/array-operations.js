const Uint32 = require('../uint32');

/**
 * ArrayOperations provides methods to work with arrays and Uint8Arrays
 */
class ArrayOperations {
    /**
     * Return where sequence starts if the sequence exists or false if not
     * @param {Array} array
     * @param {Array} sequence - sequence to search for
     * @param {number} offset - where search begins
     * @returns {(boolean|number)}
     */
    static getPositionSequenceInArray(array, sequence, offset) {
        /** loop through array from the precised offset */
        for (let x = offset; x < array.length; x += 1) {
            /**
             * loop through the sequence
             */
            for (let y = 0; y < sequence.length; y += 1) {
                /**
                 * if any of the values does not match the sequence
                 * then break the loop through the sequence
                 */
                if (array[x + y] !== sequence[y]) {
                    break;
                }

                /**
                 * if the last element of sequence is reached
                 * return the position of the sequence
                 */
                if (y === sequence.length - 1) {
                    return x;
                }
            }
        }
        return false;
    }

    /**
     * TODO: only sequence.length is used, so it should be changed
     * Replace a sequence in an array by another sequence
     * @param {Uint8Array} array
     * @param {number} offset - where replacement should start
     * @param {Uint8Array} sequence - old sequence
     * @param {Uint8Array} replace - new sequence
     * @returns {Uint8Array} new array with replaced sequence
     */
    static replaceSectionInArray(array, offset, sequence, replace) {
        // splits array in two parts segmentFirst and segmentSecond
        const segmentFirst = array.slice(0, offset);
        const segmentSecond = array.slice(offset + sequence.length);

        /**
         * initiates the new array that we are going to return
         * @type {Uint8Array}
         */
        const uint8array = new Uint8Array(
            array.length - (sequence.length - replace.length)
        );

        const secondLoopLimit = replace.length + segmentFirst.length;
        const thirdLoopLimit = secondLoopLimit + segmentSecond.length;

        // fills the array with the segment before the replacement
        let x = 0;
        for (x = 0; x < segmentFirst.length; x += 1) {
            uint8array[x] = segmentFirst[x];
        }

        // next, fills the array with the replacement
        let y = 0;
        for (x = segmentFirst.length; x < secondLoopLimit; x += 1) {
            uint8array[x] = replace[y];
            y += 1;
        }

        // finally, fills the array with segment after the replacement
        y = 0;
        for (x = secondLoopLimit; x < thirdLoopLimit; x += 1) {
            uint8array[x] = segmentSecond[y];
            y += 1;
        }

        return uint8array;
    }

    /**
     * Get position of null terminator in C-style string for .STRINGS files
     * @param array
     * @param {number} offset - where String Data starts
     * @returns {number} null terminator position
     * @throws will throw an error if no null terminator is found
     */
    static getNullTerminatorOfCStyleStringStrings(array, offset) {
        for (let x = offset; x < array.length; x += 1) {
            if (array[x] === 0) {
                return x;
            }
        }
        throw new Error('Null terminator not found.');
    }

    /**
     * Get position of null terminator in C-style string for .DLSTRINGS, .ILSTRINGS files
     * @param array
     * @param {number} offset - where String Data starts
     * @returns {number} null terminator position
     * @throws will throw an error if no null terminator is found
     */
    static getNullTerminatorOfCStyleStringDlstrings(array, offset) {
        const slice = array.slice(offset, offset + 4);
        const position = Uint32.fromByteArrayToDecimal(slice) + 4 + offset - 1;

        if (array[position] === 0) {
            return position;
        }
        throw new Error('Null terminator not found.');
    }

    /**
     * Concatenate arrays
     * @param {...(Uint8Array|Array.<number>)} arrays
     * @returns {Uint8Array}
     */
    static concatArrays(...arrays) {
        const finalArrayLength = arrays.reduce((accumulator, currentArray) => {
            return accumulator + currentArray.length;
        }, 0);

        const uint8array = new Uint8Array(finalArrayLength);

        arrays.reduce((accumulator, currentValue) => {
            const lengthCurrent = currentValue.length;

            for (let x = accumulator; x < lengthCurrent + accumulator; x += 1) {
                uint8array[x] = currentValue[x - accumulator];
            }

            return accumulator + lengthCurrent;
        }, 0);

        return uint8array;
    }
}

module.exports = ArrayOperations;
