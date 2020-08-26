class ComputeTx
{
    /**
     * Convert decimal to an array of bytes
     * @param {number} decimal
     * @returns {Uint8Array} length always equal to 4
     */
    static convertDecimalToByteArray(decimal) {
        let uint8Array =  new Uint8Array(4);

        for (let n = 3; n > -1;n--) {
            const divisor = Math.pow(256, n);
            const remainder = decimal % divisor;

            uint8Array[n] = (decimal - remainder) / divisor;

            decimal = remainder;
        }

        return uint8Array;
    }

    /**
     * Calculates uint32 value from 4-bytes array
     * @param {number[]} array
     * @returns {number}
     */
    static computeLengthFromByteArray (array) {
        return (array[0]) + (array[1] * 256) + (array[2] * 256 * 256) + (array[3] * 256 * 256 * 256);
    }
}

module.exports = ComputeTx;
