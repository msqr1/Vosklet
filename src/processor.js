// A copy and pass processor, check if already registered
if(typeof BRProcessor === "undefined") {
  var BRProcessor = class extends AudioWorkletProcessor {
    constructor(options) {
      super(options)
      this.done = false
      this.port.onmessage = (ev) => {
        switch(ev.cmd) {
          case "init":
            this.recognizerPort = ev.ports[0]
            this.wasmMem = new Float32Array(WebAssembly.Memory.buffer).subarray(ev.ptr, ev.ptr+512)
            break
          case "deinit":
            this.done = true
            break
        }
      }
    }
    process(inputs, outputs, params) {
      if(this.done) return false;
      inputs[0].copyFromChannel(this.wasmMem, this.channel)
      this.recognizerPort.postMessage(".") // Basically an empty message
      outputs = inputs
      return true
    }
  }
  registerProcessor("BRProcessor", BRProcessor)
}