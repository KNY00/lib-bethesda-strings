const ComputeTx = require('./ComputeTx.js');
const ArrayOperations = require('./ArrayOperations.js');

class BufferStructure {
    /**
     * constructor
     * @param {Uint8Array} array
     * @param {String} fileType
     */
    constructor(array, fileType) {
        this.arrayData = array;

        this.bufferLength = (this.arrayData).length;

        this._textLength = this.getTextSequenceLength();

        this._initialPoint = this.getWhereTextStarts();

        this.fileType = fileType;
    }

    /**
     * Gets length of the text from where it starts to the end of the file
     * Based on the second sequence of four pairs of Bytes
     * @description : if ILSTRINGS or DLSTRINGS, starts 4 bytes before first char
     * @returns {number} Length
     */
    getTextSequenceLength() {
        let segment = (this.arrayData).slice(4, 8);

        return ComputeTx.computeLengthFromByteArray(segment);
    }

    /**
     * Gets absolute offset of string sequence
     * @description : if ILSTRINGS or DLSTRINGS, starts with 4 pairs of bytes as an uint8
     * @returns {number}
     */
    getWhereTextStarts() {
        return this.bufferLength - this._textLength;
    }

    /**
     * returns an array of objects
     * @returns {object[]}
     */
    getBufferObject() {
        let addresses = [];

        let bufferIndexOffset = this.arrayData.slice(8, this.initialPoint);

        for (let x = 0; x < bufferIndexOffset.length; x += 8) {
            const arrayRelativeOffset = bufferIndexOffset.slice(x + 4, x + 8);
            const relativeOffset = ComputeTx.computeLengthFromByteArray(arrayRelativeOffset);

            const arrayId = bufferIndexOffset.slice(x, x + 4);
            const id = ComputeTx.computeLengthFromByteArray(arrayId);

            const absoluteOffset = BufferStructure.getStringAbsoluteOffset(this.initialPoint, relativeOffset);

            const nullPoint = this.getNullPoint(this.arrayData, absoluteOffset);

            const entry = this.arrayData.slice(absoluteOffset, nullPoint);

            addresses.push({
                id: id,
                address: x + 8,
                relativeOffset: relativeOffset,
                absoluteOffset: absoluteOffset,
                nullPoint: nullPoint,
                length: entry.length,
                stringArray: entry
            });
        }

        return addresses;
    }

    /**
     * returns Absolute offset based on initialPoint and relative offset of structure
     * @param {number} initialPoint
     * @param {number} relativeOffset
     * @returns {number}
     */
    static getStringAbsoluteOffset(initialPoint, relativeOffset) {
        return initialPoint + relativeOffset;
    }

    get initialPoint() {
        return this._initialPoint;
    }

    get textLength() {
        return this._textLength;
    }

    /**
     * To uses the appropriate method to get null point based on file extension
     * @param {number[]} array
     * @param {number} offset
     * @returns {number}
     * @throws will throw an error if extension is not supported
     */
    getNullPoint(array, offset) {
        if (this.fileType === 'dlstrings' || this.fileType === 'ilstrings') {
            return ArrayOperations.findNullPointInDotDlstringsOrIlstringsString(array, offset);
        } else if (this.fileType === 'strings'){
            return ArrayOperations.findNullPointInDotStringsString(array, offset);
        }

        throw 'File extension is not supported.';
    }
}

module.exports = BufferStructure;
