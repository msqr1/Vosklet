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
  constructor(url, storepath) {
    super()
    this.obj = new Module.model(url, storepath, objs.length)
  }
  delete() {
    this.obj.delete()
  }
}
class SpkModel extends EventTarget {
  constructor(url, storepath) {
    super()
    this.obj = new Module.spkModel(url, storepath, objs.length)
  }
  delete() {
    this.obj.delete()
  }
}
Module.deleteAll = () => {
  objs.forEach(obj => obj.delete())
}
Module.makeModel = async (url, storepath) => {
  let mdl = new Model(url, storepath)
  return new Promise((resolve, reject) => {
    if(mdl.checkModel()) {
      objs.push(mdl)
      resolve(mdl)
    }
    (async () => {
      let res = await fetch(url)
      if(!res.ok) {
        reject("Unable to download model")
      }
      let arr = await res.arrayBuffer()
      let mdlMem = Module._malloc(arr.byteLength) // Will free in C++
      Module.HEAP8.set(new Int8Array(arr), mdlMem)
      mdl.addEventListener("_continue", (ev) => {
        if(ev.details === ".") {
          objs.push(mdl)
          resolve(mdl)
        }
        reject(ev.details)
      }, {once : true})
      mdl.afterFetch(mdlMem, arr.byteLength)
    })()
  })
}
Module.makeSpkModel = async (url, storepath, id) => {
  let mdl = new Model(url, storepath)
  return new Promise((resolve, reject) => {
    if(mdl.checkModel()) {
      objs.push(mdl)
      resolve(mdl)
    }
    (async () => {
      let res = await fetch(url)
      if(!res.ok) {
        reject("Unable to download model")
      }
      let arr = await res.arrayBuffer()
      let mdlMem = Module._malloc(arr.byteLength) // Will free in C++
      Module.HEAP8.set(new Int8Array(arr), mdlMem)
      mdl.addEventListener("_continue", (ev) => {
        if(ev.details === ".") {
          objs.push(mdl)
          resolve(mdl)
        }
        reject(ev.details)
      }, {once : true})
      mdl.afterFetch(mdlMem, arr.byteLength)
    })()
  })
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
