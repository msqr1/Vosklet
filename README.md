# Overview
- A speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Designed with basic/nothrow exception safety
- See the *examples* folder for examples on using the API 
- See the *devel* folder for the newest build (not guaranteed to work) and the JS build script

# Compared to vosk-browser:
- Support multiple models
- Model storage path management
- Model ID management (for model updates)
- Smaller JS size (>3.1MB vs 1.4MB gzipped)
- All related files (pthread worker, worklet processor,...) are merged
- Shorter from-scratch build time
- Faster loading and processing time

# Basic usage
```
<!DOCTYPE html>
<html>
  <head>
    <script src="Vosklet.js" async defer></script>
    <script>
      async function start() {
        let ctx = new AudioContext({sampleRate : 16000})
        let micNode = ctx.createMediaStreamSource(await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000
          },
        }))
        let module = await loadVosklet()
        let model = await module.createModel("en-model.tgz","model","ID")
        let recognizer = await module.createRecognizer(model, 16000)
        recognizer.addEventListener("result", ev => {
          console.log("Result: ", ev.detail)
        })
        recognizer.addEventListener("partialResult", ev => {
          console.log("Partial result: ", ev.detail)
        })
        let transferer = await module.createTransferer(ctx)
        transferer.port.onmessage = ev => {
          recognizer.acceptWaveform(ev.data)
        }
        micNode.connect(transferer)
      }
    </script>
    <button onclick="start()">Start</button>
  </head>
</html>
```
