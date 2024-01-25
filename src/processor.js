registerProcessor("wasmMemCpy", class extends AudioWorkletProcessor {
  constructor(options) {
    super(options)
    this.retval = true
    this.port.onmessage = (ev) => {
      switch(ev.cmd) {
        case "init":
          this.ptr = ev.ptr
          this.wasmMem = ev.wasmMem
          this.recognizerPort = ev.ports[0]
          break
        case "deinit":
          this.retval = false
          break
      }
    }
  }
  process(input, output, param) {
    const data = input[0][0]
    this.recognizerPort.postMessage("done")
    return this.retval
  }
})