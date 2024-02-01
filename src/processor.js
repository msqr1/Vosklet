// A copy and pass processor
registerProcessor("BRProcessor", class extends AudioWorkletProcessor {
  constructor(options) {
    super(options)
    this.done = false
    this.port.onmessage = (ev) => {
      switch(ev.cmd) {
        case "init":
          this.recognizerPort = ev.ports[0]
          this.wasmMem = new Float32Array(WebAssembly.Memory.buffer).subarray(ev.ptr, ev.ptr+512)
          this.channel = ev.channel
          
          break
        case "deinit":
          this.done = true
      }
    }
  }
  process(inputs, outputs, params) {
    if(this.done) return false;
    this.wasmMem.set(inputs[0].getChannelData(this.channel));
    this.recognizerPort.postMessage(".") 
    outputs = inputs
    return true
  }
})