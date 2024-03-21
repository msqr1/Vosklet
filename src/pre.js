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
async function getFileHandle(path, create = false) {
  let components = path.split("/")
  let prevDir = await navigator.storage.getDirectory()
  for(let component of components.slice(0, -1)) {
    prevDir = await prevDir.getDirectoryHandle(component, { create : create })
  }
  return prevDir.getFileHandle(components[components.length - 1], { create : create })
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
    let mdl = new genericModel(url, storepath, id, normalMdl)
    let tar
    mdl.addEventListener("0", async (ev) => {
      switch(ev.detail) {
        case "0":
          return mdl
        default:
          mdl.delete()
          throw ev.detail
      }
    }, { once : true })
    mdl.obj = new Module.genericModel(objs.length - 1, normalMdl, "/" + storepath, id)
    try {
      let dataFile = await (await getFileHandle(storepath + "/model.tgz")).getFile()
      let idFile = await (await getFileHandle(storepath + "/id")).getFile()
      if(await idFile.text() !== id) throw ""
      tar = await new Response(dataFile.stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()   
    }
    catch {
      try {
        let res = await fetch(url)
        if(!res.ok) {
          throw "Unable to download model"
        }
        let newDataFile = await (await getFileHandle(storepath + "/model.tgz", true)).createWritable()
        tar = await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()
        await newDataFile.write(tar)
        await newDataFile.close()
        let newIDFile = await (await getFileHandle(storepath + "/id", true)).createWritable()
        await newIDFile.write(id)
        await newIDFile.close()
      }
      catch(e) {
        mdl.obj.delete()
        throw e
      }
    }
    let tarStart = Module._malloc(tar.byteLength)
    Module.HEAPU8.set(new Uint8Array(tar), tarStart)
    mdl.obj.extractAndLoad(tarStart, tar.byteLength)
  }
  delete() {
    if (this.obj) this.obj.delete()
  }
}
Module.makeModel = async (url, storepath, id) => {
  return genericModel._init(url, storepath, id, true)
}
Module.makeSpkModel = async (url, storepath, id) => {
  return genericModel._init(url, storepath, id, false)
}
class Recognizer extends EventTarget {
  constructor() {
    super()
    objs.push(this)
  }
  static async _init(model, sampleRate, mode, grammar, spkModel) {
    let rec = new Recognizer()
    rec.addEventListener("0", (ev) => {
      if(ev.detail === "0") {
        rec.ptr = Module._malloc(512)
        return rec
      }
      rec.delete()
      throw ev.detail
    }, { once : true })
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
/*let pthreadUrl = URL.createObjectURL(new Blob(['(',
  (() => {
    { PTHREAD_SCRIPT }
  }).toString()
, ')()'], {type : "text/javascript"})) */