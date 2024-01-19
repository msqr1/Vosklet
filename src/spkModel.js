class SpkModel extends EventTarget{
  constructor() {
    super()
  }
  init(url, storepath, id) {
    this.obj = new BrowserRecognizer.__spkModel__(url, storepath, id, __genericObj__.objects.length)
    __genericObj__.objects.push(this)
  }
  delete() {
    this.obj.delete()
  }
}