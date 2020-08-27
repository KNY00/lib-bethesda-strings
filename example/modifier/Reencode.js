const ArrayOperations = require('../../src/ArrayOperations.js');
const iconv = require('iconv');

class Reencode
{
    static errorLog = [{actual: "€", expected: [128]}, {actual: "À", expected: [192]}, {
        actual: "Á",
        expected: [193]
    }, {actual: "‚", expected: [130]}, {actual: "Â", expected: [194]}, {
        actual: "ƒ",
        expected: [131]
    }, {actual: "Ã", expected: [195]}, {actual: "„", expected: [132]}, {actual: "Ä", expected: [196]}, {
        actual: "…",
        expected: [133]
    }, {actual: "Å", expected: [197]}, {actual: "†", expected: [134]}, {actual: "Æ", expected: [198]}, {
        actual: "‡",
        expected: [135]
    }, {actual: "Ç", expected: [199]}, {actual: "ˆ", expected: [136]}, {actual: "È", expected: [200]}, {
        actual: "‰",
        expected: [137]
    }, {actual: "É", expected: [201]}, {actual: "Š", expected: [138]}, {actual: "Ê", expected: [202]}, {
        actual: "‹",
        expected: [139]
    }, {actual: "Ë", expected: [203]}, {actual: "Œ", expected: [140]}, {actual: "Ì", expected: [204]}, {
        actual: "Í",
        expected: [205]
    }, {actual: "Ž", expected: [142]}, {actual: "Î", expected: [206]}, {actual: "Ï", expected: [207]}, {
        actual: "Ð",
        expected: [208]
    }, {
        actual: "‘",
        expected: [145]
    }, {actual: "Ñ", expected: [209]}, {actual: "’", expected: [146]}, {actual: "Ò", expected: [210]}, {
        actual: "“",
        expected: [147]
    }, {actual: "Ó", expected: [211]}, {actual: "”", expected: [148]}, {actual: "Ô", expected: [212]}, {
        actual: "•",
        expected: [149]
    }, {actual: "Õ", expected: [213]}, {actual: "–", expected: [150]}, {actual: "Ö", expected: [214]}, {
        actual: "—",
        expected: [151]
    }, {actual: "×", expected: [215]}, {actual: "˜", expected: [152]}, {actual: "Ø", expected: [216]}, {
        actual: "™",
        expected: [153]
    }, {actual: "Ù", expected: [217]}, {actual: "š", expected: [154]}, {actual: "Ú", expected: [218]}, {
        actual: "›",
        expected: [155]
    }, {actual: "Û", expected: [219]}, {actual: "œ", expected: [156]}, {actual: "Ü", expected: [220]}, {
        actual: "Ý", expected: [221]
    }, {actual: "ž", expected: [158]}, {actual: "Þ", expected: [222]}, {
        actual: "Ÿ",
        expected: [159]
    }, {actual: "ß", expected: [223]}, {actual: "à", expected: [224]}, {
        actual: "¡",
        expected: [161]
    }, {actual: "á", expected: [225]}, {actual: "¢", expected: [162]}, {actual: "â", expected: [226]}, {
        actual: "£",
        expected: [163]
    }, {actual: "ã", expected: [227]}, {actual: "¤", expected: [164]}, {actual: "ä", expected: [228]}, {
        actual: "¥",
        expected: [165]
    }, {actual: "å", expected: [229]}, {actual: "¦", expected: [166]}, {actual: "æ", expected: [230]}, {
        actual: "§",
        expected: [167]
    }, {actual: "ç", expected: [231]}, {actual: "¨", expected: [168]}, {actual: "è", expected: [232]}, {
        actual: "©",
        expected: [169]
    }, {actual: "é", expected: [233]}, {actual: "ª", expected: [170]}, {actual: "ê", expected: [234]}, {
        actual: "«",
        expected: [171]
    }, {actual: "ë", expected: [235]}, {actual: "¬", expected: [172]}, {actual: "ì", expected: [236]}, {
        actual: "­",
        expected: [173]
    }, {actual: "í", expected: [237]}, {actual: "®", expected: [174]}, {actual: "î", expected: [238]}, {
        actual: "¯",
        expected: [175]
    }, {actual: "ï", expected: [239]}, {actual: "°", expected: [176]}, {actual: "ð", expected: [240]}, {
        actual: "±",
        expected: [177]
    }, {actual: "ñ", expected: [241]}, {actual: "²", expected: [178]}, {actual: "ò", expected: [242]}, {
        actual: "³",
        expected: [179]
    }, {actual: "ó", expected: [243]}, {actual: "´", expected: [180]}, {actual: "ô", expected: [244]}, {
        actual: "µ",
        expected: [181]
    }, {actual: "õ", expected: [245]}, {actual: "¶", expected: [182]}, {actual: "ö", expected: [246]}, {
        actual: "·",
        expected: [183]
    }, {actual: "÷", expected: [247]}, {actual: "¸", expected: [184]}, {actual: "ø", expected: [248]}, {
        actual: "¹",
        expected: [185]
    }, {actual: "ù", expected: [249]}, {actual: "º", expected: [186]}, {actual: "ú", expected: [250]}, {
        actual: "»",
        expected: [187]
    }, {actual: "û", expected: [251]}, {actual: "¼", expected: [188]}, {actual: "ü", expected: [252]}, {
        actual: "½",
        expected: [189]
    }, {actual: "ý", expected: [253]}, {actual: "¾", expected: [190]}, {actual: "þ", expected: [254]}, {
        actual: "¿",
        expected: [191]
    }, {actual: "ÿ", expected: [255]}];

    /*static arraySectionReencode(array) {

        for (let index = 0; index < Reencode.errorLog.length; index++) {

            let sequence = Reencode.errorLog[index].actual;
                sequence = [...Buffer.from(sequence)];

            let replacement = Reencode.errorLog[index].expected;

            let position = 0;

            while (position !== false) {
                position = ArrayOperations.findPositionSequenceInArray(array, sequence, position);

                if (position !== false) {
                    array = ArrayOperations.replaceSectionInArray(array, position, sequence, replacement);
                }
            }
        }

        return array;
    }*/

    /**
     *
     * @param {ArrayBuffer} array
     * @returns {*}
     */
    static arraySectionReencode(array) {
        let ic = new iconv.Iconv('utf-8', 'windows-1252');
        const buffer = Buffer.from(array);

        // conversion
        let buf = ic.convert(
            buffer
            );

        return buf;
    }
}

module.exports = Reencode;