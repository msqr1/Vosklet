let objs =  []
class Recognizer extends EventTarget {
  constructor() {
    super()
  }
  _init(model, sampleRate) {
    this.obj  = new Module.recognizer(model, sampleRate, objs.length)
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
class Model extends EventTarget {
  constructor() {
    super()
  }
  _init(url, storepath) {
    this.obj = new Module.model(url, storepath, objs.length)
    objs.push(this)
  }
}
Module.deleteAll = () => {
  objs.forEach(obj => obj.delete())
}
Module.makeModel = async (url, storepath, id) => {
  let mdl = new Model()
  mdl.obj(new Module.model(url, storepath, objs.length))
  objs.push(mdl)
  let retval = new Promise((resolve, reject) => {
    rec.addEventListener("_continue", (ev) => {
      if(mdl.checkModel()) {
      
      }
      if(ev.details === ".") {
        resolve(mdl)
      }
      reject(ev.details)
    }, {once : true})
    
  })
  let mdlMem
  try {
    
    let res = await fetch(url)
    if(!res.ok) throw res.statusText
    let arr = await res.arrayBuffer()
    mdlMem = Module._malloc(arr.byteLength) // Will free in C++
    Module.HEAP8.set(new Int8Array(arr), mdlMem)
    mdl.afterFetch(mdlMem, arr.byteLength)
  }
  catch(e) {
    mdl.delete()
    return Promise.reject(e.message || e)
  }
  objs.push(mdl)
  return mdl
}
Module.makeSpkModel = async (url, storepath, id) => {
  let mdl = new Module.SpkModel(storepath, id)
  let mdlMem
  try {
    if(mdl.checkModelFiles() && mdl.checkModelId()) {
      objs.push(mdl)
      return mdl
    }
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
  objs.push(mdl)
  return mdl
}
Module.makeRecognizer = (model, sampleRate) => {
  let rec = new Recognizer()
  let retval = new Promise((resolve, reject) => {
    rec.addEventListener("_continue", (ev) => {
      if(ev.details == ".") {
        resolve(rec)
      }
      reject(ev.details)
    }, {once : true})
  })
  rec._init(model.obj, sampleRate)
  return retval
}
