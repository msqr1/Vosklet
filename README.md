# Overview
- A speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Designed with strong exception safety
- See the examples folder for ways to use the API
- See the devel folder for the absolutely newest build (not guaranteed to work) and the JS build script

# Additions to vosk-browser:
- Download multiple models
- Model storage path management (for multiple models)
- Model ID management (for model updates)

# User agent notes
## SharedArrayBuffer
Browser-recognizer require SharedArrayBuffer to share thread's data, so these response headers must be set:
- ***Cross-Origin-Embedder-Policy*** ---> ***require-corp***
- ***Cross-Origin-Opener-Policy*** ---> ***same-origin***

If you can't set them, you may use a HACKY workaround at *src/addCOI.js*.

## Origin Private Filesystem (OPFS)
Browser-recognizer needs the Emscripten WASMFS' OPFS to store its model, IDBFS was considered, but dropped because there is no direct way to read from IDBFS to C++ without copying to MEMFS (basically RAM). For safety with this, always:
- Try catch ```window.loadBR()``` to to check for OPFS availability.
- Check if there is enough space via ```navigator.storage.estimate()``` for **model + compressed model** before calling makeModel 

# API interface
## JS ```window``` object
| Function signature | Description |
|---|---|
|```Promise<Module> loadBR()``` | Load Emscripten's Module |

## Shared interface
| Function signature  | Description |
|---|---|
| ```delete()``` | Delete this object, see [why](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run) this is neccessary.

## ```Module``` object 
| Function signature | Description |
|---|---|
| ```Promise<Model> makeModel(path: string, url: string, id: string)```<br><br>```Promise<SpkModel> makeSpkModel(path: string, url: string, id: string)``` | Make a ```Model``` or ```SpkModel```<br>- If **path** contains valid model files and **id** is the same, there will not be a fetch from **url**.<br>- If **path** doesn't contain valid model files, or if it contains valid model files but **id** is different, there will be a fetch from **url**, and the model is stored with **id**. Model files must be directly under the model root folder, and compressed model must be in .tgz format. |
| ```Promise<Recognizer> makeRecognizer(model: Model, sampleRate: float)``` | Make a ```Recognizer```, it will use **model**'s thread if it's the first user of **model**, else it will use a new thread.
| ```setLogLevel(lvl: int)``` | Set Vosk's log level (default: ```0```: Info) <br>```-2```: Error<br>```-1```: Warning<br>```1```: Verbose<br>```2```: More verbose<br>```3```: Debug |
| ```revokeURLs()``` | Revoke the Blob URLs of pthread worker and worklet processor |
| ```cleanUp()``` | A convenience function that call ```revokeURLs()``` and ```delete()``` on all objects and . You should put this at the end of your program! |

## ```Recognizer``` object 
| Function signature | Description |
|---|---|
| ```Promise<AudioWorkletNode> getNode(ctx: AudioContext, channelIndex = 0: int)``` | Get a pass-through node that recognize audio and is connectable to a processing graph. It has 1 input and 1 output, **channelIndex** must point to a 16-bit mono channel of the input |
| ```recognize(buf: AudioBuffer, channelIndex = 0: int)``` | Recognize an AudioBuffer, usually from something like ```BaseAudioContext.decodeAudioData()```, **channelIndex** must point to a 16-bit mono channel of **buf**
| ```setPartialWords(partialWords: bool)``` | Return words' information in a partialResult event (default: false) |
| ```setWords(words: bool)``` | Return words' information in a result event (default: false) |
| ```setNLSML(nlsml: bool)``` | Return result and partialResult in NLSML form (default: false) |
| ```setMaxAlternatives(alts: int)``` | Set the max number of alternatives for result event (default: false) |
| ```setGrm(grm: string)``` | Add grammar to the recognizer (default: none) |
| ```setSpkModel(mdl: SpkModel)``` | Set the speaker model of the recognizer (default: none) |

| Event | Description |
|---|---|
| ```partialResult``` | There is a partial recognition result, check the event's "details" property |
| ```result``` | There is a full recognition result, check the event's "details" property |

# Compilation
Changing any option to non-default values requires recompilation
```
git clone --depth=1 https://github.com/msqr1/Browser-recognizer &&
cd Browser-recognizer &&
[Options] make
```
| Option | Description | Default value |
|---|---|---|
| MAX_MEMORY | Set max memory, valid suffixes: kb, mb, gb, tb or none (bytes) | ```300mb```, as [recommended](https://alphacephei.com/vosk/models) |
| MAX_THREADS | Set the max number of thread (2 min) | ```2``` (1 OPFS thread + 1 model/recognizer thread) |
| COMPILE_JOBS | Set the number of jobs (threads) when compiling | ```$(nproc)```   |
| EMSDK | Set EMSDK's path (will install EMSDK in root folder if unset) | ```../emsdk``` |

# TODO:
- Fix libarchive extract closing issue
- setSpkModel avoid spawning extra thread
- Top level await in API usage
- Write examples 
- Balance code size and speed 
