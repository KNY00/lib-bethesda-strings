const fs = require('fs');
const path = require('path');
const modifyEncoding = require('./modifier/EncodingClass.js');
const BufferOperations = require('../src/BufferOperations.js');

const extension = '.DLSTRINGS';
const fileName = `Skyrim_French${extension}`;
const filePath = path.join(__dirname, '/../files/input/french-utf8', fileName);
const filePathOutput = path.join(__dirname, '/../files/output', fileName);

const condition = () => true;

const modification = (stringArray) =>
    modifyEncoding.convertUtf8ToWindows1252(stringArray);

fs.readFile(filePath, (err, data) => {
    if (err) {
        throw err;
    }
    const bufferOperationInstance = new BufferOperations(
        Uint8Array.from(data),
        extension.slice(1).toLowerCase()
    );
    const arr = bufferOperationInstance.modifyEntries(condition, modification);

    fs.writeFile(filePathOutput, Buffer.from(arr), (error) => {
        if (error) {
            return console.log(error);
        }
        console.log('The file was saved!');
    });
});
