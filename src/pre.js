let objs = [] 
let dStream = new DecompressionStream("gzip")
Module.revokeURLs = () => {
  URL.revokeObjectURL(pthreadUrl)
  URL.revokeObjectURL(processorUrl)
} 
Module.cleanUp = () => {
  objs.forEach(obj => obj.delete())
  Module.revokeURLs()
}
Module.locateFile = (path, scriptDir) => {
  if(path === "BrowserRecognizer.worker.js") return pthreadUrl
  return scriptDir+path
}
class genericModel extends EventTarget {
  constructor() {
    super()
    objs.push(this)
  }
  static async _init(url, storepath, id, normalMdl) {
    let mdl = new genericModel()
    return new Promise((resolve, reject) => {
      mdl.addEventListener("_continue", (ev) => {
        if(ev.detail === "0") {
          return resolve(mdl)
        }
        mdl.delete()
        reject(ev.detail)
      }, {once : true})
      mdl.addEventListener("_checkMdl", (ev) => {
        switch(ev.detail) {
          case "0":
            mdl.load(true);
            break;
          case "fetch":
            (async () => {
              let res = await fetch(url)
              if(!res.ok) {
                return reject("Unable to download model")
              }
              let wStream = await (await (await navigator.storage.getDirectory()).getFileHandle("m0dEl.tar", {create : true})).createWritable()
              let tarReader = res.body.pipeThrough(dStream).getReader()
              while(true) {
                let readRes = await tarReader.read()
                if(!readRes.done) await wStream.write(readRes.value)
                else break
              }
              await wStream.close()
              mdl.obj.afterFetch()
            })()
            break;
          default:
            reject(ev.detail)
        }
      }, {once : true})
      if(normalMdl) mdl.obj = new Module.model(storepath, id, objs.length-1)
      else mdl.obj = new Module.spkModel(storepath, id, objs.length-1)
      mdl.obj.checkModel()
    })
  }
  delete() {
    if (this.obj) this.obj.delete()
  }
}
Module.makeModel = async (url, storepath, id) => {
  return genericModel._init(url, storepath, id,true)
}
Module.makeSpkModel = async (url, storepath, id) => {
  return genericModel._init(url, storepath, id, false)
}
class Recognizer extends EventTarget {
  constructor() {
    super()
    objs.push(this)
  }
  static async _init(model, sampleRate) {
    let rec = new Recognizer()
    return new Promise((resolve, reject) => {
      rec.addEventListener("_continue", (ev) => {
        if(ev.detail == "0") {
          rec.ptr = Module._malloc(512)
          return resolve(rec)
        }
        rec.delete()
        reject(ev.detail)
      }, {once : true})
      rec.obj = new Module.recognizer(model, sampleRate, objs.length-1)  
    })
  }
  async getNode(ctx, channelIndex = 0) {
    if(typeof this.node === "undefined") {
      let msgChannel = new MessageChannel()
      await ctx.audioWorklet.addModule(processorUrl)
      this.node = new AudioWorkletNode(ctx, 'BRProcessor', { channelCountMode: "max", numberOfInputs: 1, numberOfOutputs: 1, processorOptions: { ptr: this.ptr, channel: channelIndex, recognizerPort: msgChannel.port1 } })
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
    if (this.obj) this.obj.delete()
    if(this.node) this.node.postMessage("0")
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
  setSpkModel(spkModel) {
    this.obj.setSpkModel(spkModel.obj)
  }
  setNLSML(nlsml) {
    this.obj.setNLSML(nlsml)
  }
  setMaxAlternatives(alts) {
    this.obj.setMaxAlternatives(alts)
  }
}
Module.makeRecognizer = (model, sampleRate) => {
  return Recognizer._init(model.obj, sampleRate)
}
let processorUrl = URL.createObjectURL(new Blob(['(',
  (() => {
    registerProcessor("BRProcessor", class extends AudioWorkletProcessor {
      constructor(options) {
        this.done = false
        this.port.onmessage = (ev) => this.done = true
        this.ptr = options.processorOptions.ptr 
        this.recognizerPort = options.processorOptions.recognizerPort
        this.channelIndex = options.processorOptions.channelIndex
      }
      process(inputs, outputs, params) {
        if(this.done) return false;
        this.wasmMem.set(inputs[0].getChannelData(this.channelIndex));
        this.recognizerPort.postMessage("0") 
        outputs = inputs
        return true
      }
    })
  }).toString()
, ')()'], {type : "text/javascript"}))
let pthreadUrl = URL.createObjectURL(new Blob(['(',
  (() => {
    // FIXME: Copy content of worker.js with -O0 here
  }).toString()
, ')()'], {type : "text/javascript"}))