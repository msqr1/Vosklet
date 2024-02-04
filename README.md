# Browser-recognizer
- A speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- The API is also designed with strong exception safety
## Global and all objects' common interface 
| Function signature (global) | Description |
|---|---|
| ```Promise<Model> makeModel(path: string, url: string, id: string)```<br><br>```Promise<SpkModel> makeSpkModel(path: string, url: string, id: string)``` | Make a ```Model``` or ```SpkModel```<br>- If **path** contains valid model files and **id** is the same, there will not be a fetch from **url**.<br>- If **path** doesn't contain valid model files, or if it contains valid model files but **id** is different, there will be a fetch from **url**, and the model is stored with **id**. |
| ```Promise<Recognizer> makeRecognizer(model: Model, sampleRate: float)``` | Make a ```Recognizer```, it will use **model**'s thread if it's the first user of **model**, else it will use a new thread.
| ```setLogLevel(lvl: int)``` | Set Vosk's log level (default: ```0```: Info) <br>```-2```: Error<br>```-1```: Warning<br>```1```: Verbose<br>```2```: More verbose<br>```3```: Debug |
| ```cleanUp()``` | Call ```delete()``` on all objects and revoke all Blob URLs. |

| Function signature (all objects) | Description
|---|---|
| ```delete()``` | Delete this object, see [why](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run) this is neccessary.
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
## Compilation
Changing any setting to non-default values requires recompilation
```
git clone --depth=1 https://github.com/msqr1/Browser-recognizer &&
cd Browser-recognizer &&
[Options] ./compile.sh
```
| Option | Description | Default value |
|---|---|---|
| MAX_MEMORY | Set max memory, valid suffixes: kb, mb, gb, tb or none (bytes) | ```300mb```, as [recommended](https://alphacephei.com/vosk/models) |
| MAX_THREADS | Set the max number of thread (2 min) | ```2``` (1 OPFS thread + 1 model/recognizer thread) |
| COMPILE_JOBS | Set the number of jobs (threads) when compiling | ```$(nproc)```   |
| EMSDK | Set EMSDK's path (will install EMSDK in root folder if unset) | ```../emsdk``` |
## Response headers
Browser-recognizer require SharedArrayBuffer, so these response headers must be set:
- ***Cross-Origin-Embedder-Policy*** ---> ***require-corp***
- ***Cross-Origin-Opener-Policy*** ---> ***same-origin***

If you can't set them, you may use a VERY HACKY workaround at *src/addCOI.js*.
## Additions to vosk-browser:
- Download multiple models
- Model storage path management (when many models are required)
- Model ID management (when model updates are required)

## Usage
```
<!--Load this from a script tag-->
<script src="BrowserRecognizer.js"></script>
<script>
  // Select name
  const BrRec = await loadBR()

  // Prepare 
  const model = await BrRec.makeModel(")
  const recognizer = await BrRec.makeRecognizer(model)
  recognizer.addEventListener("result", e => {
    console.log("Result: ",e.details)
  })
  recognizer.addEventListener("partialResult", e => {
    console.log("Partial result: ",e.details)
  })

  // Microphone setup
  media = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate: 16000
    },
  })

</script>
```
