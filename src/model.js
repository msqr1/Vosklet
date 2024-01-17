class Model extends EventTarget{
  constructor(url, storepath, id) {
    super()
    this.obj = (async () => {
      return new Module.__model__(url, storepath, id, __genericObj__.objects.length)
    })()
    __genericObj__.objects.push(this)
  }
  delete() {
    this.obj.then(() => {
      this.obj.delete()
    })
  }
}