class Recognizer extends EventTarget {
  constructor() {
    super()
  }
  init(model) {
    ctx = new (AudioContext || webkitAudioContext)()
    new BrowserRecognizer.__recognizer__(model.obj,ctx.sampleRate,__genericObj__.objects.length)
    ctx.close()
    __genericObj__.objects.push(this)
  }
  start() {
      this.obj.start()
  }
  stop() {
      this.obj.stop()
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