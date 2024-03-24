# API interface
## JS' ```window``` object
| Function/Object | Description |
|---|---|
|```Promise<Module> loadVosklet()``` | Load Vosklet module interface |

## Shared interface
| Function/Object  | Description |
|---|---|
| ```delete()``` | Delete this object, see [why](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run) this is neccessary. |

## ```Module``` object 
| Function/Object | Description |
|---|---|
| ```Promise<Model> makeModel(path: string, url: string, id: string)```<br><br>```Promise<SpkModel> makeSpkModel(path: string, url: string, id: string)``` | Make a ```Model``` or ```SpkModel```, model files must be directly under the model root, and compressed model must be in .tgz format. If:<br>- **path** contains valid model files and **id** is the same, there will not be a fetch from **url**.<br>- **path** doesn't contain valid model files, or if it contains valid model files but **id** is different, there will be a fetch from **url**, and the model is stored with **id**. Models are thread-safe, reuse them as much as possible! |
| ```Promise<Recognizer> makeRecognizer(model: Model, sampleRate: float)```<br><br>```Promise<Recognizer> makeRecognizerWithSpkModel(model: Model, spkModel: spkModel, sampleRate: float)```<br><br>```Promise<Recognizer> makeRecognizerWithGrm(model: Model, grammar: string, sampleRate: float)``` | Make a ```Recognizer```, it will use **model**'s thread if it's the first user of **model**, else it will use a new thread. |
| ```setLogLevel(lvl: int)``` | Set Vosk's log level (default: ```0```: Info) <br>```-2```: Error<br>```-1```: Warning<br>```1```: Verbose<br>```2```: More verbose<br>```3```: Debug |
| ```cleanUp()``` | A convenience function that call ```delete()``` on all objects and revoke all URLs. **Put this at the end of your code!** |
| ```epMode``` | Endpointer modes (enum) | See Vosk's description |

## ```Recognizer``` object 
| Function/Object | Description |
|---|---|
| ```Promise<AudioWorkletNode> getNode(ctx: AudioContext, channelIndex = 0: int)``` | Get a node that process audio. It has 1 input and no output, **channelIndex** must point to a 16-bit mono channel of the input |
| ```recognize(buf: AudioBuffer, channelIndex = 0: int)``` | Recognize an AudioBuffer, usually from something like ```BaseAudioContext.decodeAudioData()```, **channelIndex** must point to a 16-bit mono channel of **buf**
| ```setPartialWords(partialWords: bool)``` | See Vosk's description (default: false) |
| ```setWords(words: bool)``` | See Vosk's description (default: false) |
| ```setNLSML(nlsml: bool)``` | See Vosk's description (default: false) |
| ```setMaxAlternatives(alts: int)``` | See Vosk's description (default: false) |
| ```setGrm(grm: string)``` | See Vosk's description (default: none) |
| ```setSpkModel(mdl: SpkModel)``` | See Vosk's description (default: none) |
| ```setEndpointerMode(mode: epMode)``` | See Vosk's description (default: ANSWER_DEFAULT) |
| ```setEndpointerDelays(tStartMax: float, tEnd: float, tMax: float)``` | See Vosk's description | 

| Event | Description |
|---|---|
| ```partialResult``` | There is a partial recognition result, check the event's "details" property |
| ```result``` | There is a full recognition result, check the event's "details" property |

# User agent notes
## SharedArrayBuffer
Vosklet require SharedArrayBuffer to share thread's data, so these response headers must be set:
- ***Cross-Origin-Embedder-Policy*** ---> ***require-corp***
- ***Cross-Origin-Opener-Policy*** ---> ***same-origin***

If you can't set them, you may use a hacky workaround at *src/addCOI.js*.

# Compilation
Changing any option to non-default values requires recompilation
```
git clone --depth=1 https://github.com/msqr1/Vosklet &&
cd Vosklet/src &&
[Options] make
```
| Option | Description | Default value |
|---|---|---|
| MAX_MEMORY | Set max memory, valid suffixes: kb, mb, gb, tb or none (bytes) | ```300mb```, as [recommended](https://alphacephei.com/vosk/models) |
| MAX_THREADS | Set the max number of thread, this should be equal to the number of model or speaker model that is used in the program (>1) | ```1``` |
| COMPILE_JOBS | Set the number of jobs (threads) when building | ```$(nproc)```   |
| EMSDK | Set EMSDK's path (will install EMSDK in root folder if unset) | ```../emsdk``` |
