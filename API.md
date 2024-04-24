# API reference
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
| ```Promise<Model> createModel(url: string, path: string, id: string)```<br><br>```Promise<SpkModel> createSpkModel(url: string, path: string, id: string)``` | Create a ```Model``` or ```SpkModel```, model files must be directly under the model root, and compressed model must be in .tgz format. If:<br>- **path** contains valid model files and **id** is the same, there will not be a fetch from **url**.<br>- **path** doesn't contain valid model files, or if it contains valid model files but **id** is different, there will be a fetch from **url**, and the model is stored with **id**. Models are thread-safe, reuse them as much as possible! |
| ```Promise<Recognizer> createRecognizer(model: Model, sampleRate: float)```<br><br>```Promise<Recognizer> createRecognizerWithSpkModel(model: Model, spkModel: spkModel, sampleRate: float)```<br><br>```Promise<Recognizer> createRecognizerWithGrm(model: Model, grammar: string, sampleRate: float)``` | Create a ```Recognizer```, it will use **model**'s thread if it's the first user of **model**, else it will use a new thread. |
| ```setLogLevel(lvl: int)``` | Set Vosk's log level (default: ```0```: Info) <br>```-2```: Error<br>```-1```: Warning<br>```1```: Verbose<br>```2```: More verbose<br>```3```: Debug |
| ```Promise<AudioWorkletNode> createTransferer(ctx: AudioContext, bufferSize: int)``` | Create a node that transfer its inputs back to the main thread with custom buffer size (must be multiple of 128). Its port's ```onmessage``` handler can be set to get audio data. Has 1 input with 1 channel and 0 output. The the higher the size, the lesser the audio breaks up, but the higher the latency. Recomended value is around ```128 * 150```. |
| ```cleanUp()``` | A convenience function that call ```delete()``` on all objects and revoke all URLs. **Put this at the end of your code!** |
| ```epMode``` | Endpointer modes (enum) | See Vosk's description |

## ```Recognizer``` object 
| Function/Object | Description |
|---|---|
| ```acceptWaveform(audioData: Float32Array)``` | Recognize audio data in a ```Float32Array``` with elements from -1.0 to 1.0. |
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
| ```partialResult``` | There is a partial recognition result, check the event's *detail* property |
| ```result``` | There is a full recognition result, check the event's *detail* property |

# User agent notes
## SharedArrayBuffer
Vosklet require SharedArrayBuffer to share threads' data, so these response headers must be set:
- ***Cross-Origin-Embedder-Policy*** ---> ***require-corp***
- ***Cross-Origin-Opener-Policy*** ---> ***same-origin***

If you can't set them, you may use a hacky workaround at *src/addCOI.js*.

# Compilation
- Requires ```autotools```'s commands in PATH
- Changing any option to non-default values requires recompilation
- To re-make a specific target, erase its directory in the repo root and run ```./make``` again. Doing this will also re-make the final JS
```shell
git clone --depth=1 https://github.com/msqr1/Vosklet &&
cd Vosklet/src &&
[Options] ./make
# Example: MAX_MEMORY=350mb MAX_THREADS=2 ./make
```
| Option | Description | Default value |
|---|---|---|
| MAX_MEMORY | Set max memory, valid suffixes: kb, mb, gb, tb or none (bytes) | ```300mb``` as [recommended](https://alphacephei.com/vosk/models) |
| MAX_THREADS | Set the max number of threads (>=1), this should be equal to the number of model or speaker model that is used in the program | ```1``` (1 recognizer, 1 model, 0 speaker model) |
| JOBS | Set the number of jobs (threads) when building | ```$(nproc)```   |
| EMSDK | Set EMSDK's path (will install EMSDK in root folder if unset) | ```../emsdk``` |
