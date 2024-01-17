# Browser-recognizer
- A from-microphone speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Browser-recognizer can run on the main thread, as well as a web worker, see the "Important" section below for more information
## Interface
- setLogLevel: set Kaldi's log level (default: -1)
    - -2: Error
    - -1: Warning
    - 0: Info 
    - 1: Verbose
    - 2: More verbose
    - 3: Debug
### Model and SpkModel
```
new Model(url, storepath, uid)
new SpkModel(url, storepath, uid)
```
#### Functions
- ***constructor*** : Construct a model from an URL, storage path, and an UID.
    - If **storepath** contains valid model files and **uid** is the same, there will not be a fetch from **url**
    - If **storepath** doesn't contain valid model files, or if it contains valid model files, but **uid** is different, there will be a fetch from **url**, and the model is stored with **uid**
- ***delete***: Delete self and free resources
#### Events
- ***ready***: The model is ready to be put into a recognizer via the constructor for Model, or setSpkModel() for SpkModel
- ***error***: An error occured, check the event's **details** property for more information
### Recognizer
```
new Recognizer(model)
```
#### Functions
- ***constructor***: Construct a recognizer from a model object
- ***start***: Start recognizing
- ***stop***: Stop recognizing
- ***setWords***: Return words' information in a result event (default: false)
- ***setPartialWords***: Return words' information in a partialResult event (default: false)
- ***setNLSML***: Return result and partialResult in NLSML form (default: false)
- ***setMaxAlternatives***: Set the max number of alternatives for result event (default: false)
- ***setGrm***: Add grammar to the recognizer (default: none)
- ***setSpkModel***: Set the speaker model of the recognizer (default: none)
#### Events
- ***partialResult***: There is a partial recognition result, check the event's **details** property
- ***result***: There is a full recognition result, check the event's **details** property
- ***error***: An error occured, check the event's **details** property for more information
- ***delete***: Delete self and free resources
## Other key points
### IMPORTANT 
- You MUST call delete() on objects at the end of its usage. Or put: 

    ```
    __genericObj__.objects.forEach(obj => obj.delete())
    ```
    at the end of your program to automatically do that. We have to do this because Emscripten doesn't call destructors. See [here](https://emscripten.org/docs/getting_started/FAQ.html#what-does-exiting-the-runtime-mean-why-don-t-atexit-s-run).
- If you choose to use this on the main thread, always handle the API through events
### Guarantees
- If an error occurs (error event is fired), no changes was made, and no other dependent events will fire. For example, if an error occur while loading the model, the "ready" event won't fire in order to prevent executing code on a nonexistent model.
### Limitations compared to vosk-browser:
- Microphone only
- Fixed memory size at 300MB, changing it require recompilation 
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

```
