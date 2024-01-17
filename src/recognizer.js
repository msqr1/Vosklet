class Recognizer extends EventTarget {
  constructor(model) {
    ctx = new (AudioContext || webkitAudioContext)()
    this.obj = (async () => {
      new Module.__recognizer__(model.obj,ctx.sampleRate,__genericObj__.objects.length)
    })()
    __genericObj__.objects.push(this)
    ctx.close()
    return this;
  }
  start() {
    this.obj.then(() => {
      this.obj.start()
    })
  }
  stop() {
    this.obj.then(() => {
      this.obj.stop()
    })
  }
  delete() {
    this.obj.then(() => {
      this.obj.deinit()
      this.obj.delete()
    })
  }
  setWords(words) {
    this.obj.then(() => {
      this.obj.setWords(words)
    })
  }
  setPartialWords(partialWords) {
    this.obj.then(() => {
      this.obj.setPartialWords(partialWords)
    })
  }
  setGrm(grm) {
    this.obj.then(() => {
      this.obj.setGrm(grm)
    })
  }
  setSpkModel(model) {
    this.obj.then(() => {
      this.obj.setSpkModel(model.obj)
    })
  }
  setNLSML(nlsml) {
    this.obj.then(() => {
      this.obj.setNLSML(nlsml)
    })
  }
  setMaxAlternatives(alts) {
    this.obj.then(() => {
      this.obj.setMaxAlternatives(alts)
    })
  }
}