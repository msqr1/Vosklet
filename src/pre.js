// @externs
let objs =  []
class Recognizer extends EventTarget {
  constructor(rec) {
    super()
    this.obj = rec
    objs.push(this)
    this.ptr = Module._malloc(512)
    this.arr = Module.HEAPF32.subarray(this.ptr, this.ptr+512)
  }
  async getNode(ctx, channelIndex = 0) {
    if(typeof this.node === "undefined") {
      let msgChannel = new MessageChannel()
      ctx.AudioWorklet.addModule("src/processor.js")
      this.node = new AudioWorkletNode(ctx, 'BRProcessor', { channelCountMode: "max", numberOfInputs: 1, numberOfOutputs: 1 })
      this.node.port.postMessage({cmd : "init", ptr: this.ptr, channel: channelIndex}, [msgChannel.port1])
      msgChannel.port1.onmessage = (ev) => {
        this.obj.acceptWaveForm()
      } 
      return this.node
    }
  }
  recognize(buf, channelIndex = 0) {
    buf.copyFromChannel(this.arr, channelIndex)
    this.obj.acceptWaveForm()
  }
  delete() {
    this.obj.delete()
    if(typeof this.node !== "undefined") {
      this.node.port.postMessage({cmd : "deinit"})
    }
  }
  setWords(words) {
    this.obj.setWords(words)
  }
  setPartialWords(partialWords) {
    this.obj.setPartialWords(partialWords)
  }
  setGrm(grm) {
    this.obj.setGrm(grm)
  }
  setSpkModel(model) {
    this.obj.setSpkModel(model.obj)
  }
  setNLSML(nlsml) {
    this.obj.setNLSML(nlsml)
  }
  setMaxAlternatives(alts) {
    this.obj.setMaxAlternatives(alts)
  }
}
Module.deleteAll = () => {
  objs.forEach(obj => obj.delete())
}
Module.makeModel = async (url, path, id) => {
  let mdl
  try {
    mdl = new Module.Model(url, path, id)
  }
  catch(e) {
    mdl.delete()
    return Promise.reject(e)
  }
  objs.push(mdl)
  return mdl
}
Module.makeSpkModel = async (url, path, id) => {
  let mdl
  try {
    mdl = new Module.SpkModel(url, path, id)
  }
  catch(e) {
    mdl.delete()
    return Promise.reject(e)
  }
  objs.push(mdl)
  return mdl
}
Module.makeRecognizer = async (model, sampleRate) => {
  let rec
  try {
    rec = new Module.recognizer(model, sampleRate, objs.length)
  }
  catch(e) {
    rec.delete()
    return Promise.reject(e)
  }
  return new Recognizer(rec)
}
