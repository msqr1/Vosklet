let objs =  []
class recognizer extends EventTarget {
  constructor(rec,ctx) {
    super()
    this.obj = rec
    this.ptr = Module._malloc(512)
    let channel = new MessageChannel()
    this.copier = new AudioWorkletNode(ctx, 'BRCopier', { channelCount: 1, numberOfInputs: 1, numberOfOutputs: 0 })
    this.copier.port.postMessage({cmd : "init", ptr: this.ptr},[channel.port1])
    channel.port1.onmessage = (ev) => {
      this.obj.acceptWaveForm(this.ptr, 512)
    } 
    objs.push(this)
  }
  delete() {
    this.obj.delete()
    this.copier.port.postMessage({cmd : "deinit"})
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
    mdl = new Module.model(url, path, id)
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
    mdl = new Module.spkModel(url, path, id)
  }
  catch(e) {
    mdl.delete()
    return Promise.reject(e)
  }
  objs.push(mdl)
  return mdl
}, ctx.AudioWorklet
Module.makeRecognizer = async (model, ctx) => {
  let rec
  try {
    rec = new Module.recognizer(model, ctx.sampleRate, objs.length)
  }
  catch(e) {
    rec.delete()
    return Promise.reject(e)
  }
  await ctx.AudioWorklet.addModule(URL.createObjectURL(new Blob([`
