const BufferStructure = require('../src/buffer/structure');
const ArrayOperations = require('../src/array-operations');
const Uint32 = require('../src/uint32');

/** mock ArrayOperations */
jest.mock('../src/array-operations');

describe('Test constructor and getters', () => {
    beforeEach(() => {
        jest.spyOn(Uint32, 'fromByteArrayToDecimal').mockReturnValue(15);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    let array = new Uint8Array(15);

    array = array.map((value, index) => {
        return index;
    });

    test('constructor properties', () => {
        const instance = new BufferStructure(array, 'dlstrings');

        expect(instance.arrayData).toBe(array);
        expect(instance.bufferLength).toBe(array.length);
        expect(instance.fileType).toBe('dlstrings');
    });

    test('constructor method call getTextSequenceLength && class property textLength', () => {
        const staticFunctionSpy = jest
            .spyOn(Uint32, 'fromByteArrayToDecimal')
            .mockReturnValueOnce(16);

        const instance = new BufferStructure(array, 'dlstrings');

        expect(staticFunctionSpy).toHaveBeenCalledWith(array.slice(4, 8));
        expect(instance.textLength).toBe(16);
    });

    test('constructor method call getWhereTextStarts && class property initialPoint', () => {
        const staticFunctionSpy = jest
            .spyOn(Uint32, 'fromByteArrayToDecimal')
            .mockReturnValue(15);

        const instance = new BufferStructure(array, 'dlstrings');

        expect(instance.initialPoint).toBe(array.length - 15);
        expect(staticFunctionSpy).toHaveBeenCalledTimes(1);
    });
});

test('test static getStringAbsoluteOffset(initialPoint', () => {
    const staticFUnctionCall = BufferStructure.getStringAbsoluteOffset(5, 9);
    expect(staticFUnctionCall).toBe(14);
});

describe('Test function getBufferObject', () => {
    beforeAll(() => {
        // Clear all instances and calls to constructor and all methods:
        jest.spyOn(
            ArrayOperations,
            'getNullTerminatorOfCStyleStringDlstrings'
        ).mockReturnValue(36);
    });

    const fakeStringData = new Array(16);
    fakeStringData.fill(69, 0, 16);

    let firstLetter = 65; // A windows-1252
    const fakeString = fakeStringData.map(() => {
        return (firstLetter += 1);
    });

    const array = Uint8Array.from([
        ...[1, 1, 1, 1],
        ...[20, 0, 0, 0],
        ...[2, 0, 0, 0],
        ...[0, 0, 0, 0],
        ...[16, 0, 0, 0],
        ...fakeString,
    ]);

    /** insert null point at the end of String Data */
    array[array.length - 1] = 0;

    test('', () => {
        const instance = new BufferStructure(array, 'dlstrings');
        const returnedStringDataObject = instance.getBufferObject()[0];

        expect(returnedStringDataObject.stringArray).toEqual(
            Uint8Array.from(array.slice(16, 36))
        );

        expect(returnedStringDataObject.id).toBe(2);
        expect(returnedStringDataObject.address).toBe(8);
        expect(returnedStringDataObject.relativeOffset).toBe(0);
        expect(returnedStringDataObject.absoluteOffset).toBe(16);
        expect(returnedStringDataObject.nullPoint).toBe(16 + 4 + 16 + 1);
        expect(returnedStringDataObject.length).toBe(20);
    });
});

describe('Test function getEndPoint', () => {
    let array = new Uint8Array(15);

    array = array.map((value, index) => {
        return index;
    });

    const array2 = Uint8Array.from([0, 1, 2, 3]);

    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        ArrayOperations.mockClear();

        const mockStaticF = jest.fn();
        mockStaticF.mockReturnValue(3);
        ArrayOperations.getNullTerminatorOfCStyleStringDlstrings = mockStaticF;
        ArrayOperations.getNullTerminatorOfCStyleStringStrings = mockStaticF;
    });

    test('getEndPoint with .dlstrings or .ilstrings', () => {
        const instance = new BufferStructure(array, 'dlstrings');
        expect(instance.getEndPoint(array2, 0)).toEqual(4);
    });

    test('getEndPoint with strings', () => {
        const instance = new BufferStructure(array, 'strings');
        expect(instance.getEndPoint(array2, 0)).toEqual(4);
    });

    test('getEndPoint with not accepted extension', () => {
        const instance = new BufferStructure(array, 'badstrings');
        expect(() => {
            instance.getEndPoint(array2, 0);
        }).toThrow(/is not supported/);
    });
});
