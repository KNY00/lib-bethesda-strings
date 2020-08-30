const arrayOperations = require('../src/array-operations');

test('test static function getPositionSequenceInArray', () => {
    const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const offset = 3;
    const sequence = [6, 7];

    const returnedValue = arrayOperations.getPositionSequenceInArray(
        array,
        sequence,
        offset
    );

    expect(returnedValue).toEqual(6);

    expect(
        arrayOperations.getPositionSequenceInArray(array, sequence, 8)
    ).toEqual(false);
});

test('test static function replaceSectionInArray', () => {
    const array = Uint8Array.from([0, 1, 2, 3, 4, 5]);
    const offset = 3;
    const sequence = Uint8Array.from([3, 4]);
    const replacement = Uint8Array.from([9, 10]);

    const returnedArray = arrayOperations.replaceSectionInArray(
        array,
        offset,
        sequence,
        replacement
    );
    expect(returnedArray).toEqual(Uint8Array.from([0, 1, 2, 9, 10, 5]));
});

test('test static function getNullTerminatorOfCStyleStringStrings', () => {
    const array = new Array(4);
    array.fill(9);
    array.push(0);

    const returned = arrayOperations.getNullTerminatorOfCStyleStringStrings(
        array,
        0
    );
    expect(returned).toEqual(4);

    expect(() => {
        arrayOperations.getNullTerminatorOfCStyleStringStrings([], 0);
    }).toThrow(/not found/);
});

test('test static function getNullTerminatorOfCStyleStringDlstrings', () => {
    const array = new Array(4);
    array.fill(6);
    array.push(0);
    array.unshift(...[5, 0, 0, 0]);

    const returned = arrayOperations.getNullTerminatorOfCStyleStringDlstrings(
        array,
        0
    );
    expect(returned).toEqual(8);

    expect(() => {
        arrayOperations.getNullTerminatorOfCStyleStringDlstrings([], 0);
    }).toThrow(/not found/);
});

test('test static function concatArrays', () => {
    const listArrays = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
    ];

    const arrayReturned = arrayOperations.concatArrays(...listArrays);

    expect(arrayReturned).toHaveLength(
        listArrays[0].length + listArrays[1].length
    );

    expect(arrayReturned).toEqual(
        Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    );

    const nothingPassed = arrayOperations.concatArrays();

    expect(nothingPassed).toEqual(new Uint8Array(0));
});
