// A copy and pass processor
registerProcessor("BRProcessor", class extends AudioWorkletProcessor {
  constructor(options) {
    super(options)
    this.ret = true
    this.port.onmessage = (ev) => {
      switch(ev.cmd) {
        case "init":
          this.recognizerPort = ev.ports[0]
          this.wasmMem = new Float32Array(WebAssembly.Memory.buffer).subarray(ev.ptr, ev.ptr+512)
          this.channel = ev.channel
          this.input = ev.input
          break
        case "deinit":
          this.ret = false
          break
      }
    }
  }
  process(inputs, outputs, params) {
    if(!this.ret) return false;
    inputs[this.input].copyFromChannel(this.wasmMem, this.channel)
    outputs = inputs
    this.recognizerPort.postMessage(".") // A
    return true
  }
})