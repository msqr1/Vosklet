# Overview
- A lightweight, up to date speech recognizer in the browser with total gzipped size of **under a megabyte** (725 KB)
- Built from scratch, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser)

# Vosklet ...
- Is regularly maintained
- Support multiple models
- Include model storage management
- Include model ID management (for updates)
- Wraps all Vosk's functionaly

# Basic usage (microphone recognition in English)
- Result are logged to the console.
- Copied from *examples/fromMic.html*
- **Note: The example folder and this piece of code uses *Examples/Vosklet.js* because I can't set the Response headers for my model for browsers to decompress correctly. Instead, I used DecompressionStream to decompress manually, so *Examples/Vosklet.js* only works for the examples. In production, use the top-level Vosklet.js instead.**
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/gh/msqr1/Vosklet@1.1.3/Examples/Vosklet.min.js" async defer></script>
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
        let model = await module.createModel("https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz","model","ID")
        let recognizer = await module.createRecognizer(model, 16000)

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
