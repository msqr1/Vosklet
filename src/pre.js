var objs =  []
class recognizer extends EventTarget {
  constructor(rec) {
    super()
    this.obj = rec
    objs.push(this)
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
    objs.push(mdl)
  }
  catch(e) {
    return Promise.reject(e.message)
  }
  return mdl
}
Module.makeSpkModel = async (url, path, id) => {
  let mdl
  try {
    mdl = new Module.spkModel(url, path, id)
    objs.push(mdl)
  }
  catch(e) {
    return Promise.reject(e.message)
  }
  return mdl
}
Module.makeRecognizer = async (model, sampleRate) => {
  let rec
  try {
    rec = recognizer(new Module.recognizer(model,sampleRate, objs.length))
  }
  catch(e) {
    return Promise.reject(e.message)
  }
  return rec
}
