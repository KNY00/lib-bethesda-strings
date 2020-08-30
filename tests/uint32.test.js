const uint32 = require('../src/uint32');

test('test static function fromDecimalToByteArray', () => {
    const maximumDecimal = 256 ** 4 - 1;
    const arrayReturned = uint32.fromDecimalToByteArray(maximumDecimal);

    const typedArray = Uint8Array.from([255, 255, 255, 255]);
    expect(arrayReturned).toHaveLength(4);
    expect(arrayReturned).toEqual(typedArray);
});

test('test static function fromByteArrayToDecimal', () => {
    const array = [10, 255, 128, 3];
    const decimalReturned = uint32.fromByteArrayToDecimal(array);

    expect(decimalReturned).toEqual(
        10 + 255 * 256 + 128 * 256 ** 2 + 3 * 256 ** 3
    );
});
