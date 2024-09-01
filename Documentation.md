<h1 style="text-align:center;">API Reference</h1>

## JS ```window``` object
| Function/Object | Description |
|---|---|
| ```Promise<Module> loadVosklet()``` | Load Vosklet module interface |

## Shared interface
| Function/Object  | Description |
|---|---|
| ```delete()``` | Delete this object (call C++ destructor), see [why](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run) this is neccessary. For recognizers, make sure they finished recognizing before deleting them |

## ```Module``` object
| Function/Object | Description |
|---|---|
| ```Promise<Model> createModel(url: string, path: string, id: string)```<br><br>```Promise<SpkModel> createSpkModel(url: string, path: string, id: string)``` | Create a ```Model``` or ```SpkModel```, model files must be directly under the model root, and compressed model must be in ```.tar.gz```/```.tgz``` format. Tar format must be USTAR. If:<br>- ```path``` contains valid model files and ```id``` is the same, there will not be a fetch from ```url```.<br>- ```path``` doesn't contain valid model files, or if it contains valid model files but ```id``` is different, there will be a fetch from ```url```, and the model is stored with ```id```. Models are thread-safe and reusable across recognizers. |
| ```Promise<Recognizer> createRecognizer(model: Model, sampleRate: float)```<br><br>```Promise<Recognizer> createRecognizerWithSpkModel(model: Model, spkModel: spkModel, sampleRate: float)```<br><br>```Promise<Recognizer> createRecognizerWithGrm(model: Model, grammar: string, sampleRate: float)``` | Create a ```Recognizer``` |
| ```setLogLevel(lvl: int)``` | Set log level for Kaldi messages (default: ```0```: Info) <br>```-2```: Error<br>```-1```: Warning<br>```1```: Verbose<br>```2```: More verbose<br>```3```: Debug |
| ```Promise<AudioWorkletNode> createTransferer(ctx: AudioContext, bufferSize: int)``` | Create a node that transfer its inputs back to the main thread with custom buffer size (must be multiple of 128). Its port's ```onmessage``` handler can be set to get audio data. Has 1 input with 1 channel and no output. The the higher the size, the lesser the audio breaks up, but the higher the latency. Recomended value is around ```128 * 150```. |
| ```cleanUp()``` | A convenience function that call ```delete()``` on all objects and revoke all URLs. **Put this at the end of your code!** |
| ```EpMode``` | Enum for endpointer modes | See Vosk's description |

## ```Model``` object
| Function/Object | Description |
|---|---|
| ```int findWord(word: string)``` | Check if a word can be recognized by the model, return the word symbol if ```word``` exists inside the model or ```-1``` otherwise. Word symbol ```0``` is for epsilon. |

## ```Recognizer``` object
| Function/Object | Description |
|---|---|
| ```acceptWaveform(audioData: Float32Array)``` | Accept voice data in a ```Float32Array``` with elements from ```-1.0``` to ```1.0```. |
| ```setWords(words: bool)``` | Enables words with times in the output (default: ```false```) |
| ```setPartialWords(partialWords: bool)``` | Like above return words and confidences in partial results (default: ```false```) |
| ```setNLSML(nlsml: bool)``` | Set NLSML output (default: ```false```) |
| ```setMaxAlternatives(alts: int)``` | Configures recognizer to output n-best results (default: ```0```) |
| ```setGrm(grm: string)``` | Reconfigures recognizer to use grammar |
| ```setSpkModel(mdl: SpkModel)``` | Adds speaker model to already initialized recognizer |
| ```setEndpointerMode(mode: EpMode)``` | Set endpointer scaling factor (default: ```ANSWER_DEFAULT```) |
| ```setEndpointerDelays(tStartMax: float, tEnd: float, tMax: float)``` | Set endpointer delays |

| Event | Description |
|---|---|
| ```partialResult``` | There is a partial recognition result, check the event's ```detail``` property |
| ```result``` | There is a full recognition result, check the event's ```detail``` property |
<br>
<h1 style="text-align:center;">HTTP Remarks</h1>

## HTTPS
Vosklet is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS)
## SharedArrayBuffer
SharedArrayBuffer is necessary to share data between workers, so these response headers must be set:
- ```Cross-Origin-Embedder-Policy``` ⟶ ```require-corp```
- ```Cross-Origin-Opener-Policy``` ⟶ ```same-origin```
<br>If you can't set them, you may use a hacky workaround in *AddCOI.js*.

## Content Security Policy (CSP)
Wasm worker construction will be from a blob so the CSP:
- ```worker-src``` must include ```blob:```

<br>
<h1 style="border:2px ;text-align:center;">Compilation</h1>
- Requires all Autotools commands in PATH, ```make```, and ```pkg-config```. For example, installing with ```apt``` would be:

  ```sudo apt install autotools-dev autoconf libtool make pkg-config```
- Changing any option to non-default values requires recompilation
- To remake a specific target, erase its directory in the repo root and run ```./make``` again. Doing this will also remake the final JS
```shell
git clone --depth=1 https://github.com/msqr1/Vosklet &&
cd Vosklet/src &&
[Options] ./make
# Example: INITIAL_MEMORY=350mb MAX_THREADS=3 ./make
```
| Option | Description | Default value |
|---|---|---|
| INITIAL_MEMORY | Set inital memory, valid suffixes: kb, mb, gb, tb or none (bytes) | ```300mb``` as [recommended](https://alphacephei.com/vosk/models). This memory will grow if usage exceeds this value. |
| MAX_THREADS | Set the max number of threads (>=1), this should be equal to the number of recognizers used in the program | ```1``` |
| JOBS | Set the number of jobs (threads) when building | ```$(nproc)```   |
| EMSDK | Set EMSDK's path (will install EMSDK in root folder if unset) | ```../emsdk``` |