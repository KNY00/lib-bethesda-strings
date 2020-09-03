// BufferStructure is used in this example to compare both files
const fs = require('fs');
const path = require('path');
const { BufferOperations, BufferStructure } = require('../src/buffer');

const fileName = 'Skyrim_English.ilstrings';
const fileExtension = 'ilstrings';
const filePath = path.join(__dirname, '/../files/input/english-utf8', fileName);

/**
 * filters a stringDataObject
 * @param {StringDataObject} stringDataObject
 * @returns {boolean} true if the object was filtered
 */
const filter = (stringDataObject) => {
    // we transform the word to a Uint8Array
    const name = 'Louder than the roar of';
    const buffer = Buffer.from(name);
    const searchUint8Array = Uint8Array.from(buffer);

    // We get from  StringDataObject, stringArray
    // We slice it to match the length of the UintArray of the word that we are searching.
    const searchLength = searchUint8Array.length;
    const objectStartsWith = stringDataObject.stringArray.slice(
        4, // it's an ilstring so Data String contains a Uint32
        searchLength + 4
    );

    // We compare the two arrays
    if (searchLength === objectStartsWith.length) {
        // then we compare each value
        for (let x = 0; x < searchLength; x += 1) {
            if (searchUint8Array[x] !== objectStartsWith[x]) {
                // any of the values does not match, the function returns false
                return false;
            }
        }
    } else {
        return false;
    }

    // the sentence was found at the beginning the function will return true
    return true;
};

/**
 * modifies String Data of objects filtered
 * @param {Uint8Array} stringArray
 * @returns {Uint8Array}
 */
const modification = (stringArray, stringDataObject) => {
    const uint8 = Uint8Array.from(
        Buffer.from("The roar wasn't that loud !!! ")
    );

    // replace last space by a null point or it will throw an error
    uint8[uint8.length - 1] = 0;
    return uint8;
};

/**
 * copares two raays
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean|*[]}
 */
function showModifiedSegment(a, b) {
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            console.log(
                Buffer.from(a.slice(4)).toString(),
                '\n\nIn the new buffer, it is replaced by:\n',
                Buffer.from(b.slice(4)).toString()
            );
            break;
        }
    }
}

/**
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
function arrayEquals(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
}

// get buffer from a file
fs.readFile(filePath, (err, data) => {
    const structure = new BufferStructure(Uint8Array.from(data), fileExtension);
    /**
     * Saves an array of StringDataObject for later comparison
     * @type {Array.<StringDataObject>}
     */
    const bufferObject = structure.getBufferObject();

    const instance = new BufferOperations(Uint8Array.from(data), fileExtension);

    // apply a modification an outputs a new buffer
    const outputUint8Array = instance.modifyEntries(filter, modification);

    // Get entries from the new modified buffer
    const classInstance = new BufferStructure(outputUint8Array, fileExtension);
    /**
     * creates StringDataObject from modified files
     * @type {StringDataObject[]}
     */
    const bufferObjectOfTheModifiedBuffer = classInstance.getBufferObject();

    bufferObjectOfTheModifiedBuffer.forEach((currentValue, index) => {
        const ancientValue = bufferObject[index];

        if (!arrayEquals(ancientValue.stringArray, currentValue.stringArray)) {
            console.log('## change made ##');
            showModifiedSegment(
                ancientValue.stringArray,
                currentValue.stringArray
            );
        }
    });
});
