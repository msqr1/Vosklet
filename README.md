# Overview
- A speech recognizer built on Vosk that can be run on the browser, inspired by [vosk-browser](https://github.com/ccoreilly/vosk-browser), but built from scratch and no code taken!
- Designed with basic/nothrow exception safety
- See the *examples* folder for examples on using the API 
- See the *devel* folder for the newest build (not guaranteed to work) and the JS build script

# Compared to vosk-browser:
- Support multiple models
- Model storage path management
- Model ID management (for model updates)
- Smaller JS size (>3.1MB vs 1.4MB)
- All related files (pthread worker, worklet processor,...) are merged
- Shorter from-scratch build time
- Faster loading and processing time

# Basic usage
- Use the prebuilt binary through JsDelivr
- See 

