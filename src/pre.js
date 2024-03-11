let objs = [] 
Module.cleanUp = () => {
  objs.forEach(obj => obj.delete())
  URL.revokeObjectURL(pthreadUrl)
  URL.revokeObjectURL(processorUrl)
}
Module.locateFile = (path, scriptDir) => {
  if(path === "Vosklet.js") return pthreadUrl
  return scriptDir+path
}

class genericModel extends EventTarget {
  constructor(url, storepath, id, normalMdl) {
    super()
    objs.push(this)
    this.url = url
    this.storepath = storepath
    this.id = id
    this.normalMdl = normalMdl
  }
  static async _init(url, storepath, id, normalMdl) {
    return new Promise((resolve, reject) => {
      let mdl = new genericModel(url, storepath, id, normalMdl)
      mdl.addEventListener("_continue", async function listener(ev) {
        switch(ev.detail) {
          case "0":
            mdl.removeEventListener("_continue", listener)
            return resolve(mdl)
          case "1":
            let res = await fetch(url)
            if(!res.ok) {
              return reject("Unable to download model")
            }
            let wStream = await (await (await navigator.storage.getDirectory()).getFileHandle("m0dEl.tar", {create : true})).createWritable()
            let tarReader = res.body.pipeThrough(new DecompressionStream("gzip")).getReader()
            while(true) {
              let readRes = await tarReader.read()
              if(!readRes.done) await wStream.write(readRes.value)
              else break
            }
            tarReader.releaseLock()
            await wStream.close()
            mdl.obj.afterFetch()
            break;
          default:
            mdl.delete()
            mdl.removeEventListener("_continue", listener)
            reject(ev.detail)
        }
      })
      mdl.obj = new Module.genericModel(storepath, id, objs.length-1, normalMdl)
      mdl.obj.check()
    })
  }
  delete() {
    if (this.obj) this.obj.delete()
  }
}
Module.makeModel = async (url, storepath, id) => {
  for (obj in objs) {
    if (typeof obj.normalMdl !== "undefined" && obj.normalMdl && obj.url === url && obj.storepath === storepath && obj.id === id) return obj;
  }
  return genericModel._init(url, storepath, id, true);
}
Module.makeSpkModel = async (url, storepath, id) => {
  for(obj in objs) {
    if(typeof obj.normalMdl !== "undefined" && !obj.normalMdl && obj.url === url && obj.storepath === storepath && obj.id === id) {
      return obj;
    }
  }
  return genericModel._init(url, storepath, id, false)
}
class Recognizer extends EventTarget {
  constructor() {
    super()
    objs.push(this)
  }
  static async _init(model, sampleRate, mode, grammar, spkModel) {
    return new Promise((resolve, reject) => {
      let rec = new Recognizer()
      rec.addEventListener("_continue", (ev) => {
        if(ev.detail === "0") {
          rec.ptr = Module._malloc(512)
          return resolve(rec)
        }
        rec.delete()
        reject(ev.detail)
      }, {once : true})
      switch(mode) {
        case 1:
          rec.obj = new Module.recognizer(model, sampleRate, objs.length-1)
          break
        case 2:
          rec.obj = new Module.recognizer(model, spkModel, sampleRate, objs.length-1) 
          break
        default:
          rec.obj = new Module.recognizer(model, grammar, sampleRate, objs.length-1, 0)  
      }
    })
  } 
  async getNode(ctx, channelIndex = 0) {
    if(typeof this.node === "undefined") {
      let msgChannel = new MessageChannel()
      await ctx.audioWorklet.addModule(processorUrl)
      this.node = new AudioWorkletNode(ctx, 'BRProcessor', { channelCountMode: "max", numberOfInputs: 1, numberOfOutputs: 1, processorOptions: { ptr: this.ptr, channel: channelIndex, recognizerPort: msgChannel.port1 } })
      msgChannel.port1.onmessage = () => {
        this.obj.acceptWaveForm()
      } 
    }
    return this.node
  }
  recognize(buf, channelIndex = 0) {
    Module.HEAPF32.set(buf.getChannelData(channelIndex).subarray(0, 512), this.ptr)
    this.obj.acceptWaveForm()
  }
  delete() {
    if (this.obj) this.obj.delete()
    if(this.node) this.node.postMessage(0)
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
  return Recognizer._init(model.obj, sampleRate, 1)
}
Module.makeRecognizerWithSpkModel = (model, sampleRate, spkModel) => {
  return Recognizer._init(model.obj, sampleRate, 2, null, spkModel)
} 
Module.makeRecognizerWithGrm = (model, sampleRate, grammar) => {
  return Recognizer._init(model.obj, sampleRate, 3, grammar, null)
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
        if(this.done) return false
        this.wasmMem.set(inputs[0].getChannelData(this.channelIndex))
        this.recognizerPort.postMessage("0") 
        outputs = inputs
        return true
      }
    })
  }).toString()
, ')()'], {type : "text/javascript"}))
/*
let pthreadUrl = URL.createObjectURL(new Blob(['(',
  (() => {
    
  }).toString()
, ')()'], {type : "text/javascript"})) 
*/