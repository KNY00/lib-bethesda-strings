const Uint32 = require('../../uint32');
const ArrayOperations = require('../../array-operations');

/**
 * @typedef {Object} StringDataObject
 * @property  {number} id
 * @property  {number} address - Directory Entry position
 * @property  {number} relativeOffset
 * @property  {number} absoluteOffset
 * @property  {number} nullPoint
 * @property  {number} length
 * @property  {Uint8Array} stringArray
 */

/**
 * class that gives informations about file buffer
 and constructs a dataString object
 */
class BufferStructure {
    /**
     * constructor
     * @constructs
     * @param {Uint8Array} array - file buffer
     * @param {String} fileType - extension ilstrings, dlstrings, strings
     */
    constructor(array, fileType) {
        this.arrayData = array;

        this.bufferLength = this.arrayData.length;

        this._textLength = this.getTextSequenceLength();

        this._initialPoint = this.getWhereTextStarts();

        this.fileType = fileType;
    }

    get textLength() {
        return this._textLength;
    }

    get initialPoint() {
        return this._initialPoint;
    }

    /**
     * Gets length of the text from where it starts to the end of the file
     * Based on the second sequence of four pairs of Bytes
     * @returns {number} Length
     * @description if ILSTRINGS or DLSTRINGS, starts 4 bytes before first char
     */
    getTextSequenceLength() {
        const segment = this.arrayData.slice(4, 8);

        return Uint32.fromByteArrayToDecimal(segment);
    }

    /**
     * Gets absolute offset of string sequence
     * The first String Data starts after the last Directory Entry
     * The last String Data will be at the end of the file
     * @returns {number}
     * @description if ILSTRINGS or DLSTRINGS, starts with 4 pairs of bytes as an uint8
     */
    getWhereTextStarts() {
        return this.bufferLength - this.textLength;
    }

    /**
     * Builds an array of objects containing all String Data Info
     * @returns {Array.<StringDataObject>} array of objects
     */
    getBufferObject() {
        /**
         * @type {StringDataObject[]}
         */
        const addresses = [];

        /** gets Directory Entries */
        const bufferIndexOffset = this.arrayData.slice(8, this.initialPoint);

        /** each Directory Entry has a length equal to 8 */
        for (let x = 0; x < bufferIndexOffset.length; x += 8) {
            const arrayRelativeOffset = bufferIndexOffset.slice(x + 4, x + 8);

            const relativeOffset = Uint32.fromByteArrayToDecimal(
                arrayRelativeOffset
            );

            const arrayId = bufferIndexOffset.slice(x, x + 4);
            const id = Uint32.fromByteArrayToDecimal(arrayId);

            const absoluteOffset = BufferStructure.getStringAbsoluteOffset(
                this.initialPoint,
                relativeOffset
            );

            const endPoint = this.getEndPoint(this.arrayData, absoluteOffset);

            const entry = this.arrayData.slice(absoluteOffset, endPoint);

            /* TODO: this is an endPoint not nullPoint terminator position */
            addresses.push({
                id: id,
                address: x + 8,
                relativeOffset: relativeOffset,
                absoluteOffset: absoluteOffset,
                nullPoint: endPoint,
                length: entry.length,
                stringArray: entry,
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

    /**
     * Uses the appropriate method to get String Data endpoint based on file extension
     * @param {Uint8Array} array
     * @param {number} offset
     * @returns {number}
     * @throws will throw an error if extension is not supported
     */
    getEndPoint(array, offset) {
        if (this.fileType === 'dlstrings' || this.fileType === 'ilstrings') {
            return (
                ArrayOperations.getNullTerminatorOfCStyleStringDlstrings(
                    array,
                    offset
                ) + 1
            );
        }
        if (this.fileType === 'strings') {
            return (
                ArrayOperations.getNullTerminatorOfCStyleStringStrings(
                    array,
                    offset
                ) + 1
            );
        }

        throw new Error('File extension is not supported.');
    }
}

module.exports = BufferStructure;
