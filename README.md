# lib-bethesda-strings
Library to edit string files of Bethesda Skyrim game. This includes files with the extension Ilstrings, Dlstrings, and Strings,

# Introduction
I have made this library to modify Skyrim translation files, with the idea to merge different languages in the subtitles. It can be used to modify any string in the game by applying a filter and a modification function.
I have used it to merge two subtitles from two different languages. I have also used it to change the encoding of the strings in files, which allowed me to convert a file whose strings were encoded in UTF8 to Windows-1252, with very few bad encoded chars.

# Under the hood
All the informations relative to the files are available on the following [link](https://en.uesp.net/wiki/Tes5Mod:String_Table_File_Format)
The library uses typed arrays (Uint8Array). Although some methods accept normal arrays; the output if it is an array will be a typed array most of the time.

# How to use it

There are two main classes BufferStructure and BufferOperations that extends from it.
BufferOperations constructor accepts two arguments :
1. the first one : content of the file as an Uint8Array
2. the second one : the extension of the file, to lower case, without the dot.

**After converting the file to a buffer you can pass it to the constructor of BufferOperations.**

```javascript
const fs = require('fs');
const filePath = "file.ilstring";

fs.readFile(filePath, (err, data) => {
    let instance = new BufferOperations(Uint8Array.from(data), 'ilstring'');
});
```

## StringDataObject
Each dialog present into the file after performing basic operations on the file will be represented as an object.
Here's StringDataObject, represented by a typescript interface :
```typescript
interface StringDataObject {
      id: number,
      address: number,
      relativeOffset: number,
      absoluteOffset: number,
      nullPoint: number,
      length: number,
      stringArray: Uint8Array
}
```
It's important to know that that object exists somewhere into the code, because it will be used as an argument for the filter function.

## stringArray
The function that will be used to modify any dialog in the file, will accept as argument a Uint8array.
From a filtered  StringDataObject, the function will only modify the key *stringArray* of that object.
stringArray in `ilstrings` and `dlstrings` files, holds a 4-bytes sequence at the beginning that will contain the full length of the string that follows it. That's not the case for `strings` files.
Every stringArray will have a null terminator at the end.

## Filter and modification function
To modify the *Uint8Array* that you have passed to the constructor, you're gonna have to set up two functions.
1. a filter function (you may find it as conditionFx)
2. a modification function (you may find it as modificationFx)

### FILTER function
The filter function accepts one argument, the StringDataObject. 
Each of its properties could be used to filter a specific dialogue in the game. For example!
1. to filter a dialogue with a length superior at x (we will use the key length in this case)
2. to filter a dialogue with string starting with x (we will convert the specified string to a Uint8array, than we will compare it with stringArray to find one or multiple matches)

The following examples show the previously mentioned filters
```javascript
// dialogues with a length superior at 10 will be modified
let filter = ( StringDataObject ) => {
    return ( StringDataObject.length > 10) ? true : false;
}


// dialogues with a string starting with "Libussa"
let filter = ( StringDataObject) => {

    // we transform the word to a Uint8Array
    const name = "Libussa";
    const buffer = Buffer.from(name);
    const libussaUint8Array = Uint8Array.from(buffer);
    
    // We get from  StringDataObject, stringArray
    // We slice it to match the length of the UintArray of the word that we are searching.
    const libussaLength = libussaUint8Array.length;
    const objectStartsWith =  StringDataObject.stringArray.slice(0, libussaLength);
    
    
    // We compare the two arrays  
    // This part is not useless since slice function does not throw an error if the result is too short 
    if (libussaLength === objectStartsWith.length) {
        // then we compare each value
        for ( let x = 0; x < libussaLength; x += 1) {
            if (libussaUint8Array[x] !== objectStartsWith[x]) {
                // any of the values does not match, the function returns false
                return false
            }
        }
    }
    
    // the sentence was found at the beginning the function will return true
    return true;
}
```
For the last example, there's is a function available in ArrayOperations class that can perform the comparison, getPositionSequenceInArray

### Modification function
This function will modify the value of stringArray of any function that will match the filter function.
It accepts two arguments:
1. stringArray
2. [ StringDataObject] this one is optional, and false if there was a modification before it. Only the id key is always true.

The return a Uint8Array of the new sentence.
The newly generated Uint8Array will replace the existing one in the  StringDataObject that the function filter have caught.

```javascript
let modification = (stringArray) => {
    return Uint8Array.from(Buffer.from("hello world"));
}
```
