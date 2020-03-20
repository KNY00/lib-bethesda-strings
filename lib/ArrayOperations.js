const ComputeTx = require('./ComputeTx.js');

class ArrayOperations
{
    /**
     * Return where sequence starts if the sequence exists or false if not
     * @param {Array} array
     * @param {Array} sequence
     * @param {number} position where search begins
     * @returns {(boolean|number)}
     */
    static findPositionSequenceInArray(array, sequence, position) {
        for (let x = position; x < array.length; x++) {
            for (let y = 0; y < sequence.length; y++) {
                if (array[x + y] !== sequence[y]) {
                    break;
                }

                if (y === sequence.length - 1) {
                    return x; // Position
                }
            }
        }
        return false;
    }

    /**
     * Replace a sequence in array by another sequence
     * @param {Uint8Array} array
     * @param {number} index
     * @param {Uint8Array} sequence
     * @param {Uint8Array} replace
     * @returns {Uint8Array}
     */
    static replaceSectionInArray(array, index, sequence, replace) {
        let segmentFirst = array.slice(0, index);
        let segmentSecond = array.slice(index + sequence.length);

        let  uint8array = new Uint8Array(array.length - (sequence.length - replace.length));

        const secondLoopLimit = replace.length + segmentFirst.length;
        const thirdLoopLimit = secondLoopLimit + segmentSecond.length;

        let x = 0;
        for (x = 0; x < segmentFirst.length; x++) {
            uint8array[x] = segmentFirst[x];
        }

        let y = 0;
        for (x = segmentFirst.length;x < secondLoopLimit; x++) {
            uint8array[x] = replace[y];
            y++;
        }

        y = 0;
        for (x = secondLoopLimit; x < thirdLoopLimit; x++) {
            uint8array[x] = segmentSecond[y];
            y++;
        }

        return uint8array;
    }

    /**
     * find position of null point in string Array for .STRINGS
     * @param array
     * @param {number} offset
     * @returns {number} Null point is where the string stops
     */
    static findNullPointInDotStringsString(array, offset) {
        for (let x = offset; x < array.length; x++) {
            if (array[x] === 0) {
                return x;
            }
        }
    }

    /**
     * find position of null point in string Array for .DLSTRINGS .ILSTRINGS
     * @param array
     * @param offset
     * @returns {*}
     */
    static findNullPointInDotDlstringsOrIlstringsString(array, offset) {
        let slice = array.slice(offset, offset + 4);
        return ComputeTx.computeLengthFromByteArray(slice) + 4 + offset;
    }

    /**
     * Concatenate arrays
     * @param {...Uint8Array} arrays
     * @returns {*|Uint8Array}
     */
    static concatArrays(...arrays) {
        const finalArrayLength = arrays.reduce((accumulator, currentArray) => {
            return accumulator + currentArray.length
        }, 0);

        let uint8array = new Uint8Array(finalArrayLength);

        arrays.reduce((accumulator, currentValue) => {
            const lengthCurrent = currentValue.length;

            for (let x = accumulator; x < lengthCurrent + accumulator; x++) {
                uint8array[x] = currentValue[x - accumulator];
            }

            return accumulator + lengthCurrent;
        }, 0);

        return uint8array;
    }
}

module.exports = ArrayOperations;
