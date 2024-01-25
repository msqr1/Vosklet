# Browser-recognizer
- A speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Browser-recognizer can run both in the browser main thread and web workers
- The API also designed to have strong exception safety
## Global and all objects' common interface 
| Function signature (global) | Description |
|---|---|
| ```Promise makeModel(path: string, url: string, id: string)```<br><br>```Promise makeSpkModel(path: string, url: string, id: string)``` | - If **path** contains valid model files and **id** is the same, there will not be a fetch from **url**.<br>- If **path** doesn't contain valid model files, or if it contains valid model files but **id** is different, there will be a fetch from **url**, and the model is stored with **id**. |
| ```setLogLevel(lvl: int)``` | Set Vosk's log level (default: -1) <br>- 2: Error<br>- 1: Warning<br>- 0: Info <br>- 1: Verbose<br>- 2: More verbose<br>- 3: Debug |
| ```deleteAll()``` | Call ```delete()``` on all objects, it is recommended to put this at the end of the program to automatically clean up. See [why](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run).|

| Function signature (all objects) | Description
|---|---|
| ```delete()``` | Delete (call C++ destructor on) this object
## ```Recognizer``` object
| Function signature | Description |
|---|---|
| ```processAudio(ctx: AudioContext)``` | Recognize an audio chunk 
| ```setPartialWords(partialWords: bool)``` | Return words' information in a partialResult event (default: false) |
| ```setWords(words: bool)``` | Return words' information in a result event (default: false) |
| ```setNLSML(nlsml: bool)``` | Return result and partialResult in NLSML form (default: false) |
| ```setMaxAlternatives(alts: int)``` | Set the max number of alternatives for result event (default: false) |
| ```setGrm(grm: string)``` | Add grammar to the recognizer (default: none) |
| ```setSpkModel(mdl: spkmodel)``` | Set the speaker model of the recognizer (default: none) |

| Event | Description |
|---|---|
| ```partialResult``` | There is a partial recognition result, check the event's "details" property |
| ```result``` | There is a full recognition result, check the event's "details" property |
## Compilation
Changing any setting to non-default values requires recompilation
```
git clone --depth=1 https://github.com/msqr1/Browser-recognizer &&
cd Browser-recognizer &&
[Name]=[Value]... ./compile.sh
```
| Name | Description | Default value |
|---|---|---|
| MAX_MEMORY | Set max memory (suffix mb, gb, or none for bytes) | 300mb, as [recommended](https://alphacephei.com/vosk/models) |
| MAX_THREAD | Set the max number of thread (min: 2) | 2 (1 OPFS thread + 1 recognizer thread) |
| EMSDK | Set EMSDK's path (will install EMSDK in root folder if unset) | **.** |
## Response headers
Browser-recognizer require SharedArrayBuffer, so these response headers must be set:
- ***Cross-Origin-Embedder-Policy*** ---> ***require-corp***
- ***Cross-Origin-Opener-Policy*** ---> ***same-origin***

If you can't set them, you may use a VERY HACKY workaround at *src/addCOI.js*.
## Additions to vosk-browser:
- Can download multiple models
- Model storage path management (when many models are required)
- Model ID management (when model updates are required)

## Usage
```
<!--Load this from a script tag-->
<script src="BrowserRecognizer.js"></script>
<!-->
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

  // Process audio
  media = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate: 16000
    },
  });

</script>
```
