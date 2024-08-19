# Overview
- A lightweight speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Designed with basic/nothrow exception safety
- See the *examples* folder for examples on using the API.
- See *API.md* for the API reference
- See *test* for a developer build script for just the JS

# Compared to vosk-browser
- Support multiple models
- Has models' storage path management
- Has models' ID management (for model updates)
- Has smaller JS size (>3.1MB vs 1.2MB gzipped)
- Has all related files (pthread worker, audio worklet processor,...) merged
- Has faster processing time
- Has shorter from-scratch build time
- Has more Vosk functions exposed

# Basic usage (microphone recognition in English)
- Result are logged to the console.
- Copied from *examples/fromMic.html*
- **Note: The example folder and this piece of code uses *examples/Vosklet.js* because I can't set the Response headers for my model for browsers to decompress correctly. Instead, I used DecompressionStream to decompress manually, so *examples/Vosklet.js* only works for the examples. In production, please use the top-level Vosklet.js instead.**
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/gh/msqr1/Vosklet@1.0.4/examples/Vosklet.min.js" async defer></script>
    <script>
      async function start() {
        // Make sure sample rate matches that in the training data
        let ctx = new AudioContext({sampleRate : 16000})

        // Setup mic with correct sample rate
        let micNode = ctx.createMediaStreamSource(await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000
          },
        }))

        // Load Vosklet module, model and recognizer
        let module = await loadVosklet()
        let model2 = await module.createModel("https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz","model","ID")
        let recognizer2 = await module.createRecognizer(model, 16000)
    
        // Listen for result and partial result
        recognizer.addEventListener("result", ev => {
          console.log("Result: ", ev.detail)
        })
        recognizer.addEventListener("partialResult", ev => {
          console.log("Partial result: ", ev.detail)
        })

        // Create a transferer node to get audio data on the main thread
        let transferer = await module.createTransferer(ctx, 128 * 150)

        // Recognize data on arrival
        transferer.port.onmessage = ev => {
          recognizer.acceptWaveform(ev.data)
        }
        // Connect to microphone
        micNode.connect(transferer)
      }
    </script>
    <!-- Start and create audio context only as a result of user's action -->
    <button onclick="start()">Start</button>
  </head>
</html>
```
