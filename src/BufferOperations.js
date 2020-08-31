const BufferSturcture = require('./buffer/structure');
const Uint32 = require('./uint32');
const ArrayOperations = require('./array-operations');

/**
 * Performs operations on the buffer
 * @extends BufferSturcture
 */
class BufferOperations extends BufferSturcture {
    /**
     * constructor
     * @constructs
     * @param {Uint8Array} array - file buffer
     * @param {string} fileType - extension ilstrings, dlstrings, strings
     */
    constructor(array, fileType) {
        super(array, fileType);

        /**
         * holds all modifications made to the buffer
         * @type {Array}
         */
        this.arrayModification = [];

        /**
         * holds the buffer
         * @type {Uint8Array}
         */
        this.arrayBuffer = array;

        /**
         * @type {Array}
         */
        this.unupdatedAdresses = [];
    }

    /**
     * TODO: this is just an alias, should be removed
     * @returns {Array<StringDataObject>}
     */
    getEntries() {
        return super.getBufferObject();
    }

    /**
     * Modify this.arrayBuffer
     * @param conditionFx
     * @param modificationFx
     * @returns {Uint8Array} array result after all modifications have been made
     */
    modifyEntries(conditionFx, modificationFx) {
        let bufferObject = super.getBufferObject();

        // Sort buffer by relative offset
        // Bigger is last
        bufferObject.sort((a, b) => {
            return a.relativeOffset - b.relativeOffset;
        });

        // PREVENTS OPERATIONS ON DUPLICATES
        // Sometimes, like for subtitles in game, a String Data can have multiple addresses
        bufferObject = bufferObject.reduce((accumulator, currentValue) => {
            let relativeOffsetAlreadyExists = false;

            /**
             * Parses previous (accumulator) values to make sure that
             * an address doesn't already point to a String Data
             */
            for (let x = 0; x < accumulator.length; x += 1) {
                if (
                    accumulator[x].relativeOffset ===
                    currentValue.relativeOffset
                ) {
                    relativeOffsetAlreadyExists = true;
                    break;
                }
            }

            if (relativeOffsetAlreadyExists) {
                this.registerAddressLocation(
                    currentValue.address,
                    currentValue.relativeOffset
                );
                return accumulator;
            } else {
                /**
                 * if it does not already exist
                 * we save the current value in the accumulator
                 */
                return [...accumulator, currentValue];
            }
        }, []);

        for (let index = 0; index < bufferObject.length; index += 1) {
            const stringDataObject = bufferObject[index];

            // bufferObject.forEach((stringDataObject, index) => {
            // Absolute offset calculated from 4-pairs-hex sequence
            const offset = this.getOffset(stringDataObject.absoluteOffset);

            /**
             * update the relative offset of the String Data
             * in the Directory Entry
             * in the Buffer
             */
            const relativeSeqLocation = stringDataObject.address + 4;
            this.Uint32ArrayUpdate(
                stringDataObject.relativeOffset - offset,
                relativeSeqLocation
            );

            /**
             * Updates relative offset of all in the Directory Entries
             * that point to the currently parsed Data String
             * It is useful here to remind that Directory Entries
             * that point to the same String Data were ignored (by the reducer)
             */
            this.updateArrayOfRelativeOffsets(
                stringDataObject.relativeOffset,
                stringDataObject.relativeOffset - offset
            );

            /**
             * gets the correct absolute offset and endpoint
             * based on changes made on the buffer
             */
            const absoluteOffsetAdapted =
                stringDataObject.absoluteOffset - offset;
            const endPoint = super.getEndPoint(
                this.arrayBuffer,
                absoluteOffsetAdapted
            );

            const stringData = this.arrayBuffer.slice(
                absoluteOffsetAdapted,
                endPoint
            );

            // applies filter then modifies ...
            if (conditionFx(stringDataObject)) {
                this.modifyString(
                    stringData,
                    absoluteOffsetAdapted,
                    stringDataObject.absoluteOffset,
                    modificationFx,
                    stringDataObject
                );
                console.log(
                    `PERCENTAGE : ${(index / bufferObject.length) * 100}`
                );
            }
        }

        // Changes total size of String Data in the
        // 8-bytes header of the buffer
        // It contains the count of strings and
        // the total size of the string data at the end of the file
        const totalTxtLength = this.getStringDataSize();
        this.Uint32ArrayUpdate(totalTxtLength, 4);

        return this.arrayBuffer;
    }

    /**
     * Sums all the modifications that occur when modifying String Data
     * @description Size of string data that follows after header and directory.
     * @returns {number} All String Data members length
     */
    getStringDataSize() {
        let totalOffset = 0;

        for (let x = 0; x < this.arrayModification.length; x += 1) {
            const row = this.arrayModification[x];

            totalOffset += row.charsAdded;
        }

        return super.textLength - totalOffset;
    }

    /**
     * Updates uint32 4-bytes array based on his position in the buffer
     * @constructs
     * @param {number} newValue - The new value to be passed
     * @param {number} location - Where the the modification should happen in the buffer
     */
    Uint32ArrayUpdate(newValue, location) {
        const arrayBytes = Uint32.fromDecimalToByteArray(newValue);

        for (let z = 0; z < arrayBytes.length; z += 1) {
            this.arrayBuffer[location + z] = arrayBytes[z];
        }
    }

    /**
     * Selects which function to use to modify String Data depending on file extension
     * @param {Uint8Array} array - String Data
     * @param {number} absoluteOffsetModified - real Absolute offset calculated, that supports changes
     * @param {number} absoluteOffsetInitial - initial Absolute offset
     * @param modificationFx - function that is going to perform modification
     * @param {StringDataObject} stringDataObject
     * @throws {Error} will throw an error if extension is not supported
     */
    modifyString(
        array,
        absoluteOffsetModified,
        absoluteOffsetInitial,
        modificationFx,
        stringDataObject
    ) {
        if (this.fileType === 'dlstrings' || this.fileType === 'ilstrings') {
            return this.modifyDotIlstringsDlStringsString(
                array,
                absoluteOffsetModified,
                absoluteOffsetInitial,
                modificationFx,
                stringDataObject
            );
        }
        if (this.fileType === 'strings') {
            return this.modifyDotStringsString(
                array,
                absoluteOffsetModified,
                absoluteOffsetInitial,
                modificationFx,
                stringDataObject
            );
        }

        throw new Error('File extension is not supported.');
    }

    /**
     * Modifies String Data on .dlstrings and .ilstrings files
     * @param {Uint8Array} array - String Data
     * @param {number} absoluteOffsetModified - real Absolute offset calculated, that supports changes
     * @param {number} absoluteOffsetInitial - initial Absolute offset
     * @param modificationFx - function that is going to perform modification
     * @param {StringDataObject} stringDataObject
     */
    modifyDotIlstringsDlStringsString(
        array,
        absoluteOffsetModified,
        absoluteOffsetInitial,
        modificationFx,
        stringDataObject
    ) {
        const originalArrayLength = array.length;

        // taking the uint32 array
        const stringSizeArray = array.slice(0, 4);

        // converting uint32 array to uint32
        const stringSize = Uint32.fromByteArrayToDecimal(stringSizeArray);

        // taking string part
        const textArray = array.slice(4);

        const processedArray = modificationFx([...textArray], stringDataObject);

        // Getting modification cost
        const modification = originalArrayLength - (processedArray.length + 4);

        // TODO: That does not do anything as the comparison is bad
        if (textArray !== processedArray) {
            // gets the length of the new entry
            const stringSizeArrayUpdated = Uint32.fromDecimalToByteArray(
                stringSize - modification
            );

            // Replacing modified section in array
            this.arrayBuffer = ArrayOperations.replaceSectionInArray(
                this.arrayBuffer,
                absoluteOffsetModified,
                array,
                ArrayOperations.concatArrays(
                    stringSizeArrayUpdated,
                    processedArray
                ) // appends the length before the new generated string
            );

            this.registerModification(absoluteOffsetInitial, modification);

            // console.log('STRING UNM : ' + Buffer.from(array).toString());
            // console.log('STRING MOD : ' + Buffer.from(processedArray).toString());
        }
    }

    /**
     * Modifies Data String on .strings files
     * @param {Uint8Array} array - String Data
     * @param {number} absoluteOffsetModified - real Absolute offset calculated, that supports changes
     * @param {number} absoluteOffsetInitial - initial Absolute offset
     * @param modificationFx - function that is going to perform modification
     * @param {StringDataObject} stringDataObject
     */
    modifyDotStringsString(
        array,
        absoluteOffsetModified,
        absoluteOffsetInitial,
        modificationFx,
        stringDataObject
    ) {
        const textArray = [...array];

        const originalArrayLength = textArray.length;

        const processedArray = modificationFx([...textArray], stringDataObject);

        // Getting modification cost
        const modification = originalArrayLength - processedArray.length;

        if (textArray !== processedArray) {
            // Replacing modified section in array
            this.arrayBuffer = ArrayOperations.replaceSectionInArray(
                this.arrayBuffer,
                absoluteOffsetModified,
                array,
                processedArray
            );

            this.registerModification(absoluteOffsetInitial, modification);

            // console.log('STRING UNM : ' + Buffer.from(array).toString());
            // console.log('STRING MOD : ' + Buffer.from(processedArray).toString());
        }
    }

    /**
     * Adds any change made to a Data String to arrayModification
     * @constructs
     * @param {number} position - absolute offset
     * @param {number} charsAdded - between text length and end of file if ilstrings or dlstrings
     */
    registerModification(position, charsAdded) {
        this.arrayModification.push({
            key: position,
            charsAdded,
        });
    }

    /**
     * Calculates a new Absolute Offset of a String Data based on all modifications made
     * @param {number} absoluteOffset - absolute offset of String Data
     * @returns {number} the new offset
     */
    getOffset(absoluteOffset) {
        const filteredArray = this.arrayModification.filter(
            (x) => x.key < absoluteOffset
        );

        let offset = 0;

        if (filteredArray.length > 0) {
            const reducer = (accumulator, currentValue) => {
                return accumulator + currentValue.charsAdded;
            };

            offset = filteredArray.reduce(reducer, 0);
        }

        return offset;
    }

    /**
     * Registers the location of a directory entry that points to a String Data
     that already has a directory entry
     * @param {number} directoryEntryLocation
     * @param {number} relativeOffset
     * @returns {boolean}
     */
    registerAddressLocation(directoryEntryLocation, relativeOffset) {
        // if the String Data has already at least 1 duplicated directory entry
        // we update the array by pushing the new DirectoryE ntry location
        for (let index = 0; index < this.unupdatedAdresses.length; index += 1) {
            const row = this.unupdatedAdresses[index];
            if (row.relativeOffset === relativeOffset) {
                this.unupdatedAdresses[index].arrayAddresses.push(
                    directoryEntryLocation
                );
                return true;
            }
        }

        this.unupdatedAdresses.push({
            relativeOffset: relativeOffset,
            arrayAddresses: [directoryEntryLocation],
        });

        return true;
    }

    /**
     * Updates the relative offset in the 8-byte structure
     for addresses that had originally the same relative offset
     * @param {number} relativeOffset
     * @param {number} newRelativeOffset
     * @returns {boolean}
     */
    updateArrayOfRelativeOffsets(relativeOffset, newRelativeOffset) {
        const row = this.unupdatedAdresses.filter(
            (item) => item.relativeOffset === relativeOffset
        );

        if (row.length > 0) {
            row[0].arrayAddresses.forEach((location) => {
                this.updateRelativeOffset(newRelativeOffset, location);
            });

            return true;
        }

        return false;
    }

    /**
     * Update Directory Entry offset by modifying the second 4-bytes array
     * @param {number} newRelativeOffset
     * @param {number} location - Directory Entry location
     */
    updateRelativeOffset(newRelativeOffset, location) {
        this.Uint32ArrayUpdate(newRelativeOffset, location + 4);
    }
}

module.exports = BufferOperations;
