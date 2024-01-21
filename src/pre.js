var objs =  []
class recognizer extends EventTarget {
  constructor(rec) {
    super()
    this.obj = rec
    objs.push(this)
  }
  processAudio(buffer) {
    if(buffer.numberOfChannels < 1) throw Error("Buffer has ",buffer.numberOfChannels, " channel")
    let data = buffer.getChannelData(0);
    if(!(data instanceof Float32Array)) throw Error("Channel data isn't a Float32Array");
  }
  delete() {
    this.obj.delete()
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
Module.deleteAll = () => objs.forEach(obj => obj.delete())
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
}
Module.makeRecognizer = async (model, sampleRate, ctx) => {
  let rec
  try {
    rec = new Module.recognizer(model,sampleRate, objs.length)
  }
  catch(e) {
    rec.delete()
    return Promise.reject(e)
  }
  return new recognizer(rec)
}
