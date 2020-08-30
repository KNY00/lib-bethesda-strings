const iconv = require('iconv');

class EncodingClass {
    /**
     * convert encoding used for the buffer
     from utf-8 to windows-1252
     from Skyrim: SE encoding to Skyrim Legendary Edition
     * @param {ArrayBuffer} array
     * @returns {*}
     */
    static convertUtf8ToWindows1252(array) {
        const ic = new iconv.Iconv('utf-8', 'windows-1252');
        const buffer = Buffer.from(array);

        // conversion
        return ic.convert(buffer);
    }
}

module.exports = EncodingClass;
