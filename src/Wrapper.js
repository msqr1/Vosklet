let objs = []
let events = ["status", "partialResult", "result"]
let processorURL = URL.createObjectURL(new Blob(['(', (() => {
  registerProcessor("VoskletTransferer", class extends AudioWorkletProcessor {
    constructor(opts) {
      super()
      this.count = 0
      this.maxCount = opts.processorOptions.maxCount
      this.buffer = new Float32Array(this.maxCount * 128)
    }
    process(inputs) {
      if(!inputs[0][0]) return true
      this.buffer.set(inputs[0][0], this.count * 128)
      this.count++
      if(this.count >= this.maxCount) {
        this.count = 0
        this.port.postMessage(this.buffer, [this.buffer.buffer])
        this.buffer = new Float32Array(this.maxCount * 128)
      }
      return true
    }
  })
}).toString(), ')()'], { type : "text/javascript" }))

Module.cleanUp = async () => {
  for(let obj of objs) await obj.delete()
  URL.revokeObjectURL(processorURL)
}

Module.createTransferer = async (ctx, bufferSize) => {
  await ctx.audioWorklet.addModule(processorURL)
  return new AudioWorkletNode(ctx, "VoskletTransferer", {
    channelCountMode : "explicit",
    numberOfInputs : 1,
    numberOfOutputs : 0,
    channelCount : 1,
    processorOptions : { maxCount: bufferSize / 128 }
  })
}

getFileHandle = async (path, create = false) => {
  let components = path.split("/")
  let prevDir = await navigator.storage.getDirectory()
  for(let component of components.slice(0, -1)) prevDir = await prevDir.getDirectoryHandle(component, { create : create })
  return prevDir.getFileHandle(components[components.length - 1], { create : create })
}

class CommonModel extends EventTarget {
  constructor() {
    super()
    objs.push(this)
  }
  delete() {
    this.obj.delete()
  }
  static async create(url, storepath, id, normalMdl) {
    let mdl = new CommonModel()
    let result = new Promise((resolve, reject) => {
      mdl.addEventListener("status", ev => {
        if(!ev.detail) {
          if(normalMdl) mdl.findWord = (word) => mdl.obj.findWord(word)
          resolve(mdl)
        }
        else reject(ev.detail)
      }, { once : true })
    })
    let tar
    try {
      let dataFile = await (await getFileHandle(storepath + "/model.tgz")).getFile()
      let idFile = await (await getFileHandle(storepath + "/id")).getFile()
      if(await idFile.text() != id) throw ""
      tar = await new Response(dataFile.stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()
    }
    catch {
      try {
        let res = await fetch(url)
        if (!res.ok) throw "Unable to download model"
        let teedBody = res.body.tee()
        let newDataFile = await (await getFileHandle(storepath + "/model.tgz", true)).createWritable()
        await newDataFile.write(await new Response(teedBody[0].pipeThrough(new CompressionStream("gzip"))).arrayBuffer())
        await newDataFile.close()
        let newIDFile = await (await getFileHandle(storepath + "/id", true)).createWritable()
        await newIDFile.write(id)
        await newIDFile.close()
        tar = await new Response(teedBody[1]).arrayBuffer()
      }
      catch(e) {
        mdl.delete()
        throw e
      }
    }
    let tarStart = _malloc(tar.byteLength)
    HEAPU8.set(new Uint8Array(tar), tarStart)
    mdl.obj = new Module.CommonModel(objs.length - 1, normalMdl, "/" + storepath, id, tarStart, tar.byteLength)
    return result
  }
}

Module.createModel = async (url, storepath, id) => {
  return CommonModel.create(url, storepath, id, true)
}

Module.createSpkModel = async (url, storepath, id) => {
  return CommonModel.create(url, storepath, id, false)
}

class Recognizer extends EventTarget {
  constructor() { 
    super()
    objs.push(this)
    return new Proxy(this, {
      get(self, prop, _) {
        if(self[prop] == undefined && self.obj[prop] == undefined) return undefined
        let p = self[prop]
        if(p) return p.bind ? p.bind(self) : p
        p = self.obj[prop]
        return p.bind ? p.bind(self.obj) : p
      }
    })
  }
  acceptWaveform(audioData) {
    let start = _malloc(audioData.length * 4)
    HEAPF32.set(audioData, start / 4)
    this.obj.acceptWaveform(start, audioData.length)
  }
  async delete(processCurrent = false) {
    let result = new Promise((resolve, _) => this.addEventListener("status", _ => {
      this.obj.delete()
      resolve()
    }, { once : true }))
    this.obj.safeDelete(processCurrent)
    return result;
  }
  static async create(model, sampleRate, mode, grammar, spkModel) {
    let rec = new Recognizer()
    let result = new Promise((resolve, reject) => {
      rec.addEventListener("status", ev => {
        if(!ev.detail) resolve(rec)
        else reject(ev.detail)
      }, { once : true })
    })
    switch(mode) {
      case 1:
        rec.obj = new Module.Recognizer(objs.length - 1, sampleRate, model)
        break
      case 2:
        rec.obj = new Module.Recognizer(objs.length -1, sampleRate, model, spkModel)
        break
      default:
        rec.obj = new Module.Recognizer(objs.length - 1, sampleRate, model, grammar, 0)
    }
    return result
  }
}

Module.createRecognizer = (model, sampleRate) => {
  return Recognizer.create(model.obj, sampleRate, 1)
}

Module.createRecognizerWithSpkModel = (model, sampleRate, spkModel) => {
  return Recognizer.create(model.obj, sampleRate, 2, null, spkModel.obj)
}

Module.createRecognizerWithGrm = (model, sampleRate, grammar) => {
  return Recognizer.create(model.obj, sampleRate, 3, grammar, null)
}