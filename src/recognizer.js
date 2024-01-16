class Recognizer extends EventTarget {
  constructor(model) {
    ctx = new (AudioContext || webkitAudioContext)()
    this.obj = new Module.__Recognizer__(model.obj,ctx.sampleRate,__GenericObj__.objects.length)
    __GenericObj__.objects.push(this)
    ctx.close()
  }
  start() {
    this.obj.start()
  }
  stop() {
    this.obj.stop()
  }
  delete() {
    this.obj.deinit()
    this.obj.delete()
  }
  setWords(words) {
    this.obj.setWords(words)
  }
  setPartialWords(partialWords) {
    this.obj.setPartialWords(words)
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