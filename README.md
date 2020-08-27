# lib-bethesda-strings
Library to edit and read .Dlstrings, .Ilstrings and .Strings files from Bethesda

# Introduction
The library is designed to read and modify Skyrim's translation files. It can be used to modify any string in the game by applying a filter function. I have used it to succefully merge two subtitles from two different language files, but in theory, nothing prevents from doing any other modification. I have also used the library to convert subtitles encoding from the encoding used by Skyrim `"Windows-1252"` to another encoding used by Skyrim: Special Edition `"UTF-8"`.

# Under the hood


**Source**: [https://en.uesp.net/wiki/Tes5Mod:String_Table_File_Format](https://en.uesp.net/wiki/Tes5Mod:String_Table_File_Format)
While dlstring, ilstrings have the same structure, .strings files are abit different.



# How to use it

There are two main classes BufferStructure and BufferOperations that extends from it.
BufferOperations constructor accepts two arguments :
1. the first one : content of the file as an Uint8Array
2. the second one : the extension of the file, to lower case, without the dot.

**After converting the file to a buffer you can pass it to the constructor of BufferOperations.**

```
const fs = require('fs');
const filePath = "file.ilstring";

fs.readFile(filePath, (err, data) => {
    let instance = new BufferOperations(Uint8Array.from(data), 'ilstring'');
});
```

## SentenceObject
**NOTE:** as i did not yet modified the class, you may find it as element.

Each dialog present into the file after performing basic operations on the file will represented as an object.
Here is the form of that object as being created into the function *getBufferObject*:
``` 
{
    id: id,
    address: x + 8,
    relativeOffset: relativeOffset,
    absoluteOffset: absoluteOffset,
    nullPoint: nullPoint,
    length: entry.length,
    stringArray: entry
}
```

Here's SentenceObject, represented by a typescript interface :
```
interface SentenceObject {
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
The function that will be used to modify any dialog in the file, will accept ony one argument a Uint8array.
From a filtered object, that function will only modify the key *stringArray* key of that object.


## Filter and modification function
To modify the *Uint8Array* that you have passed to the constructor, you're gonna have to set up two functions.
1. a filter function (you may find it as conditionFx)
2. a modification function (you may find it as modificationFx)

### FILTER function
The filter function accepts one argument, the sentenceObject. 
Each of its properties could be used to filter a specific dialogue. For example!
1. dialogues with a length superior at (we will use the key length in this case)
2. dialogues with string starting with (we will convert the specified string to a Uint8array, than we will compare it with stringArray to find one or multiple matches)

```
// dialogues with a length superior at 10 will be modified
let filter = (sentenceObject) => {
    return (sentenceObject.length > 10) ? true : false;
}


// dialogues with a string starting with "Libussa"
let filter = (sentenceObject) => {

    // we transform the word to a Uint8Array
    const name = "Libussa";
    const buffer = Buffer.from(name);
    const libussaUint8Array = Uint8Array.from(buffer);
    
    // We get from sentenceObject, stringArray
    // We slice it to match the length of the UintArray of the word that we are searching.
    const libussaLength = libussaUint8Array.length;
    const objectStartsWith = sentenceObject.stringArray.slice(0, libussaLength);
    
    
    // We compare the two arrays
    
    // This part is not useless since slice function does not throw an error if the result is too short 
    if (libussaLength === objectStartsWith.length) {
        // then we compare each value
        for ( let x = 0; x < libussaLength; x++) {
            if (libussaUint8Array[x] !== objectStartsWith[x]) {
                // any of the values does not match, the function returns false
                return false
            }
        }
    }
    
    // the sentence was found at the beginng the function will return true
    return true;
}
```

### Modification function
This function will modify the value of stringArray of any function that will match the filter function.
It accepts two arguments:
1. stringArray
2. [SentenceObject] this one is optional, and false if there was a modification before it. Only the id key is always true.

The return a Uint8Array of the new sentence.
The newly generated Uint8Array will replace the existing one in the sentenceObject that the function filter have catched.

```javascript
let modification = (stringArray) => {
    return Uint8Array.from(Buffer.from("hello world"));
}
```
