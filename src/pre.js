let objs =  []
class Recognizer extends EventTarget {
  constructor(rec) {
    super()
    this.obj = rec
    objs.push(this)
    this.ptr = Module._malloc(512)
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
    }
    return this.node
  }
  recognize(buf, channelIndex = 0) {
    Module.HEAPF32.set(buf.getChannelData(channelIndex).subarray(0, 512), this.ptr);
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
Module.makeModel = async (url, storepath, id) => {
  let mdl = new Module.Model(storepath, id)
  let mdlMem;
  if(mdl.checkModelFiles() && mdl.checkModelId()) {
    objs.push(mdl)
    return mdl
  }
  try {
    let res = await fetch(url)
    if(!res.ok) throw res.statusText
    let arr = await res.arrayBuffer()
    mdlMem = Module._malloc(arr.byteLength)
    Module.HEAP8.set(new Int8Array(arr), mdlMem)
    if(!mdl.afterFetch(mdlMem, arr.byteLength)) throw "Unable to extract model and write ID"
    if(!mdl.checkModelFiles()) throw "Model contains invalid model files"
  }
  catch(e) {
    mdl.delete()
    return Promise.reject(e.message || e)
  }
  finally {
    Module._free(mdlMem)
  }
  objs.push(mdl)
  return mdl
}
Module.makeSpkModel = async (url, storepath, id) => {
  let mdl = new Module.SpkModel(storepath, id)
  let mdlMem;
  if(mdl.checkModelFiles() && mdl.checkModelId()) {
    objs.push(mdl)
    return mdl
  }
  try {
    let res = await fetch(url)
    if(!res.ok) throw res.statusText
    let arr = await res.arrayBuffer()
    mdlMem = Module._malloc(arr.byteLength)
    Module.HEAP8.set(new Int8Array(arr), mdlMem)
    if(!mdl.afterFetch(mdlMem, arr.byteLength)) throw "Unable to extract model and write ID"
    if(!mdl.checkModelFiles()) throw "Model contains invalid model files"
  }
  catch(e) {
    mdl.delete()
    return Promise.reject(e.message || e)
  }
  finally {
    Module._free(mdlMem)
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
