let objs =  []
class Recognizer extends EventTarget {
  constructor(rec) {
    super()
    this.obj = rec
    objs.push(this)
  }
  getNode(ctx) {
    let channel = new MessageChannel()
    this.node = new AudioWorkletNode(ctx, 'BRProcessor', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 1 })
    node.port.postMessage({cmd : "init", ptr: this.ptr},[channel.port1])
    channel.port1.onmessage = (ev) => {
      this.obj.acceptWaveForm(this.ptr, 512)
    } 
    return this.node
  }
  recognize(buf) {
    buf.copyFromChannel()
    this.obj.acceptWaveForm(this.ptr, 512)
  }
  delete() {
    this.obj.delete()
    if(typeof this.node !== "undefined") {
      this.node.port.postMessage({cmd : "deinit"})
    }
    Module.free(this.ptr)
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
  ctx.close()
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
}, ctx.AudioWorklet
Module.makeRecognizer = async (model) => {
  let rec
  try {
    rec = new Module.recognizer(model, ctx.sampleRate, objs.length)
  }
  catch(e) {
    rec.delete()
    return Promise.reject(e)
  }
  return new Recognizer(rec)
}
