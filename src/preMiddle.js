registerProcessor("BRCopier", class extends AudioWorkletProcessor {
  constructor(options) {
    super(options)
    this.ret = true
    this.port.onmessage = (ev) => {
      switch(ev.cmd) {
        case "init":
          this.recognizerPort = ev.ports[0]
          this.wasmMem = new Float32Array(WebAssembly.Memory.buffer).subarray(ev.ptr, ev.ptr+512)
          break
        case "deinit":
          this.ret = false
          break
      }
    }
  }
  process(inputs, outputs, params) {
    if(!this.ret) return false;
    inputs[0].copyFromChannel(this.wasmMem, 0)
    this.recognizerPort.postMessage("done")
    return true
  }
})