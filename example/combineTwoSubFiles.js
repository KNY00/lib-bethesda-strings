const fs = require('fs');
const path = require('path');
const BufferOperations = require('../src/BufferOperations.js');
const CombineFiles = require('./modifier/CombineFiles.js');

/**
 * prefix file names
 * @type {string[]}
 */
const container = [
    'update',
    'skyrim',
    'hearthfires',
    'dragonborn',
    'dawnguard',
];

/**
 * language folder name prefix for the language that will be on top of the subtitle in-game
 * @type {string}
 */
let languageFirst = 'english';

/**
 * language folder name prefix for the language that will be at the bottom of the subtitle in-game
 * @type {string}
 */
let languageSecond = 'spanish';

/**
 * encoding used to define folder name
 * @type {string}
 */
const subfolder = '-utf8/';

[0, 1, 2, 3, 4].forEach((index) => {
    // all this section is used to name properly the files and folders
    // case sensitivity for files and folders in not that important on windows
    let rootName = container[index];
    const ext = '.ILSTRINGS';
    let extSaid = ext.toLowerCase();

    languageFirst = languageFirst[0].toUpperCase() + languageFirst.slice(1);
    languageSecond = languageSecond[0].toUpperCase() + languageSecond.slice(1);
    rootName = rootName[0].toUpperCase() + rootName.slice(1);
    extSaid = extSaid.toUpperCase();

    const fileName = `${rootName}_${languageFirst}${extSaid}`;
    const fileNameSecond = `${rootName}_${languageSecond}${extSaid}`;
    const fileNameMix = `${rootName}_${languageFirst}${extSaid}`;

    /**
     * complete file path of the language file that is going to be on top
     * @type {string}
     */
    const filePath = path.join(
        __dirname,
        '/../files/input',
        languageFirst + subfolder,
        fileName
    );

    /**
     * complete file path of the language file that is going to be at the bottom
     * @type {string}
     */
    const filePathSecond = path.join(
        __dirname,
        '/../files/input',
        languageSecond + subfolder,
        fileNameSecond
    );

    /**
     * complete file path of the output file
     * @type {string}
     */
    const filePathMix = path.join(__dirname, '/../files/output', fileNameMix);

    /**
     * condition function
     * @returns {boolean}
     */
    const condition = () => true;

    const bufferSecond = fs.readFileSync(filePathSecond);
    const fileArraySecond = Uint8Array.from(bufferSecond);

    const combineFiles = new CombineFiles(
        fileArraySecond,
        ext.toLowerCase().slice(1)
    );
    // const modification = combineFiles.modification;
    const { modification } = combineFiles;

    fs.readFile(filePath, (err, data) => {
        if (err) throw err;

        // [...data]
        const cl = new BufferOperations(
            Uint8Array.from(data),
            ext.toLowerCase().slice(1)
        );
        const arr = cl.modifyEntries(condition, modification);

        fs.writeFile(filePathMix, Buffer.from(arr), function (error) {
            if (error) {
                return console.log(error);
            }
            console.log('The file was saved!');
        });
    });
});
