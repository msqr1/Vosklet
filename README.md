# Browser-recognizer
- A speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Browser-recognizer can run both in the browser main thread and web workers.
## Global and all objects' common interface 
| Function signature (global) | Description |
|---|---|
| ```Promise makeModel(url, path, id)```<br>```Promise makeSpkModel(url, storepath, id)``` | - If **path** contains valid model files and **id** is the same, there will not be a fetch from **url**.<br>- If **path** doesn't contain valid model files, or if it contains valid model files but **id** is different, there will be a fetch from **url**, and the model is stored with **id**. |
| ```setLogLevel(level)``` | Set Vosk's log level (default: -1) <br>- 2: Error<br>- 1: Warning<br>- 0: Info <br>- 1: Verbose<br>- 2: More verbose<br>- 3: Debug |
| ```deleteAll()``` | Call ```delete()``` on all objects, it is recommended to put this at the end of the program to automatically clean up. See [here](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run).|

| Function signature (all objects) | Description
|---|---|
| ```delete()``` | Delete this Object
## ```Recognizer``` object
| Function signature | Description |
|---|---|
| ```setPartialWords(partialWords)``` | Return words' information in a partialResult event (default: false) |
| ```setWords(words)``` | Return words' information in a result event (default: false) |
| ```setNLSML(nlsml)``` | Return result and partialResult in NLSML form (default: false) |
| ```setMaxAlternatives(alts)``` | Set the max number of alternatives for result event (default: false) |
| ```setGrm(grm)``` | Add grammar to the recognizer (default: none) |
| ```setSpkModel(spkmodel)``` | Set the speaker model of the recognizer (default: none) |

| Event | Description |
|---|---|
| ```partialResult``` | There is a partial recognition result, check the event's "details" property |
| ```result``` | There is a full recognition result, check the event's "details" property |
| ```error``` | An recognition occurred, check the event's "details" property |
## Other key points
- If an error occurs, no changes was made.
- Fixed memory size at 300MB, changing it require recompilation (because the use of pthread will lead)
### Additions to vosk-browser:
- Multiple models support
- Speaker model (SpkModel) support
- Storage path management (when many models are required)
- Model ID management (when model updates are required)
### This requires SharedArrayBuffer, so set the response headers:
- ***Cross-Origin-Embedder-Policy*** ---> ***require-corp***
- ***Cross-Origin-Opener-Policy*** ---> ***same-origin***
### If you can't set these headers, you can use a VERY HACKY workaround at *src/addCOI.js*.

## Usage 
```
<!--Load this from a script tag-->
<script src="BrowserRecognizer.js"></script>
<!-->
<script>
// Choose a nice, non-conflicting name for the module
const BrRec = await loadBR()

// Prepare 
const model = BrRec.makeModel()
const spkmodel = BrRec.
</script>
```
