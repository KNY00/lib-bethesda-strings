const BufferSturcture = require('./BufferStructure.js');
const ComputeTx = require('./ComputeTx.js');
const ArrayOperations = require('./ArrayOperations.js');

class BufferOperations extends BufferSturcture {
    /**
     * constructor
     * @param {Uint8Array} array
     * @param {String} fileType
     */
    constructor(array, fileType) {
        super(array, fileType);
        this.arrayModification = [];
        this.arrayBuffer = array;
        this.unupdatedAdresses = [];
    }

    /**
     * @returns {Object[]}
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
    modifyEntries(conditionFx, modificationFx)
    {
        let bufferObject = super.getBufferObject();

        // Sort buffer by relative offset bigger is last
        bufferObject.sort((a, b) => {
            return a.relativeOffset - b.relativeOffset;
        });

        // PREVENTS OPERATIONS ON DUPLICATES
        bufferObject = bufferObject.reduce((accumulator, currentValue) => {
            let relativeOffsetAlreadyExists = false;

            for (let x = 0; x < accumulator.length; x++) {

                if (accumulator[x].relativeOffset
                    === currentValue.relativeOffset) {
                    relativeOffsetAlreadyExists = true;
                    break;
                }
            }

            if (relativeOffsetAlreadyExists) {
                this.registerAddressLocation(currentValue.address, currentValue.relativeOffset);
                return accumulator;
            } else {
                return [...accumulator, currentValue]
            }
        }, []);

        for (let index = 0; index < bufferObject.length; index++) {
            const element = bufferObject[index];

            // bufferObject.forEach((element, index) => {
            // Absolute offset calculated from 4-pairs-hex sequence
            const offset = this.getOffset(element.absoluteOffset);

            const relativeSeqLocation = element.address + 4;
            this.Uint32ArrayUpdate((element.relativeOffset - offset),  relativeSeqLocation);

            // Update relative offset of all constructs
            this.updateArrayOfRelativeOffsets(element.relativeOffset, (element.relativeOffset - offset));

            /*
             * if during a previous modification the segment string has already been changed
             * the (length) of element and his (nullPoint) change also
             * so we have to calculate them one more time here accordingly to the potential changes that have been made
             * of course the (stringArray) changes also
             * Example: xy[SPE][SPE][NULL]{3} changes to xy[Nor][NULL]{4]
             */
            const absoluteOffsetAdapted = element.absoluteOffset - offset;
            const endPoint = super.getNullPoint(this.arrayBuffer, absoluteOffsetAdapted);
            const entry = this.arrayBuffer.slice(absoluteOffsetAdapted, endPoint);

            // MODIFICATION HERE
            if (conditionFx(element)) {
                this.modifyString(entry, absoluteOffsetAdapted, element.absoluteOffset, modificationFx, element);
                console.log('PERCENTAGE : ' + ((index / bufferObject.length) * 100));
            }
        }

        // change total size of string data in the
        // 8-byte header that contains the count of strings and the total size of the string data at the end of the file
        const totalTxtLength = this.getStringDataSize();
        this.Uint32ArrayUpdate(totalTxtLength, 4);

        return this.arrayBuffer;
    }

    /**
     * gets array size from the beginning of the string data
     * @returns {number}
     */
    getStringDataSize() {
        let totalOffset = 0;

        for (let x = 0; x < this.arrayModification.length; x++) {
            const row = this.arrayModification[x];

            totalOffset += row.chars;
        }

        return super.textLength - totalOffset;
    }

    /**
     * update uint32array based on his position
     * @param {number} newValue
     * @param {number} location
     * @constructor
     */
    Uint32ArrayUpdate(newValue, location) {
        let arrayBytes = ComputeTx.convertDecimalToByteArray(newValue);

        for( let z = 0; z < arrayBytes.length; z++) {
            this.arrayBuffer[location + z] = arrayBytes[z];
        }
    }

    /**
     * Modify string on .dlstrings and .ilstrings files
     * @param array
     * @param offset
     * @param absoluteOffsetInitial
     * @param modificationFx
     * @param entryObject
     */
    modifyDotIlstringsDlStringsString(array, offset, absoluteOffsetInitial, modificationFx, entryObject) {
        const originalArrayLength = array.length;

        // taking the uint32 array
        const stringSizeArray = array.slice(0, 4);

        // converting uint32 array to uint32
        const stringSize = ComputeTx.computeLengthFromByteArray(stringSizeArray);

        // taking string part
        let textArray = array.slice(4);

        const processedArray = modificationFx([...textArray], entryObject);

        // Getting modification cost
        let modification = originalArrayLength - (processedArray.length + 4);

        // TODO: That does not do anything as the comparison is bad
        if (textArray !== processedArray) {
            // gets the length of the new entry
            const stringSizeArrayUpdated = ComputeTx.convertDecimalToByteArray(stringSize - modification);

            // Replacing modified section in array
            this.arrayBuffer = ArrayOperations.replaceSectionInArray(
                this.arrayBuffer,
                offset,
                array,
                ArrayOperations.concatArrays(stringSizeArrayUpdated, processedArray) // appends the length before the new generated string
            );

            this.registerModification(absoluteOffsetInitial, modification);

            // console.log('STRING UNM : ' + Buffer.from(array).toString());
            // console.log('STRING MOD : ' + Buffer.from(processedArray).toString());
        }
    }

    /**
     * Modify string on .strings files
     * @param array
     * @param offset
     * @param absoluteOffsetInitial
     * @param modificationFx
     * @param entryObject
     */
    modifyDotStringsString(array, offset, absoluteOffsetInitial, modificationFx, entryObject) {
        let textArray = [...array];

        const originalArrayLength = textArray.length;

        const processedArray = modificationFx([...textArray], entryObject);

        // Getting modification cost
        const modification = originalArrayLength - processedArray.length;

        if (textArray !== processedArray) {
            // Replacing modified section in array
            this.arrayBuffer = ArrayOperations.replaceSectionInArray(
                this.arrayBuffer,
                offset,
                array,
                processedArray
            );

            this.registerModification(absoluteOffsetInitial, modification);

            // console.log('STRING UNM : ' + Buffer.from(array).toString());
            // console.log('STRING MOD : ' + Buffer.from(processedArray).toString());
        }
    }

    /**
     * Selects which function to use to modify string depending of file extension
     * @param array
     * @param offset
     * @param absoluteOffsetInitial
     * @param modificationFx
     * @param entryObject
     */
    modifyString(array, offset, absoluteOffsetInitial, modificationFx, entryObject) {
        if (this.fileType === 'dlstrings' || this.fileType === 'ilstrings') {
            return this.modifyDotIlstringsDlStringsString(array, offset, absoluteOffsetInitial, modificationFx, entryObject,);
        } else if (this.fileType === 'strings'){
            return this.modifyDotStringsString(array, offset, absoluteOffsetInitial, modificationFx, entryObject,);
        }

        throw 'File extension is not supported.';
    }

    /**
     * Records any change made to string part of the file (between text length and end of file )
     * @param position
     * @param numberCharAffected
     */
    registerModification(position, numberCharAffected) {
        this.arrayModification.push({
            key: position,
            chars: numberCharAffected
        })
    }

    /**
     * Calculates what needs to be added to get (the exact position) of string based on previous modifications
     * @param {number} position relative offset based on 8-byte address of a string
     * @returns {number} the sum of addition and deletion made before the specified string
     */
    getOffset(position) {
        const filteredArray = this.arrayModification.filter(x => x.key < position);

        let offset = 0;

        if (filteredArray.length > 0) {
            const reducer = ((accumulator, currentValue) => {
                return accumulator + currentValue.chars;
            });

            offset = filteredArray.reduce(reducer, 0);
        }

        return offset;
    }


    /**
     * Register location of an entry that has a non unique relativeOffset
     * @param {number} addressLocation
     * @param {number} relativeOffset
     * @returns {boolean}
     */
    registerAddressLocation(addressLocation, relativeOffset) {
        // if key of relativeOffset already exists in array
        // we update array by pushing the new value
        for(let index = 0; index < this.unupdatedAdresses.length; index++) {
            const row = this.unupdatedAdresses[index];
            if (row.relativeOffset === relativeOffset) {
                this.unupdatedAdresses[index].arrayAddresses.push(addressLocation);
                return true;
            }
        }

        this.unupdatedAdresses.push({
            relativeOffset: relativeOffset,
            arrayAddresses: [addressLocation]
        });

        return true;
    }

    /**
     * Updates the relative offset in the 8-byte structure for addresses that had the same relative offset
     * @param relativeOffset
     * @param newRelativeOffset
     * @returns {boolean}
     */
    updateArrayOfRelativeOffsets(relativeOffset, newRelativeOffset) {
        const row = this.unupdatedAdresses.filter(item => item.relativeOffset === relativeOffset);

        if (row.length > 0) {
            row[0].arrayAddresses.forEach(location => {
                this.updateRelativeOffset(newRelativeOffset, location);
            });

            return true;
        }

        return false;
    }

    /**
     * Update relative offset with new value by modifying the second 4-byte array
     * @param newRelativeOffset
     * @param location
     */
    updateRelativeOffset(newRelativeOffset, location) {
        location += 4;

        this.Uint32ArrayUpdate(newRelativeOffset,  location);
    }
}

module.exports = BufferOperations;