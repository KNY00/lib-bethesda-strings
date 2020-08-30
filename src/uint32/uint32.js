class Uint32 {
    /**
     * Convert decimal to an array of 4 bytes
     * @param {number} decimal - decimal number
     * @returns {Uint8Array} 4 bytes array
     */
    static fromDecimalToByteArray(decimal) {
        const uint8Array = new Uint8Array(4);
        let decimalNumber = decimal;

        for (let n = 3; n > -1; n -= 1) {
            const divisor = 256 ** n;
            const remainder = decimalNumber % divisor;

            uint8Array[n] = (decimalNumber - remainder) / divisor;

            decimalNumber = remainder;
        }

        return uint8Array;
    }

    /**
     * Calculates uint32 value from 4-bytes array
     * @param {number[]|Uint8Array} array
     * @returns {number}
     */
    static fromByteArrayToDecimal(array) {
        return (
            array[0] +
            array[1] * 256 +
            array[2] * 256 * 256 +
            array[3] * 256 * 256 * 256
        );
    }
}

module.exports = Uint32;
