class Model extends EventTarget{
  constructor() {
    super()
  }
  init(url, storepath, id) {
    this.obj = new Module.__model__(url, storepath, id, __genericObj__.objects.length);
    __genericObj__.objects.push(this)
  }
  delete() {
    this.obj.then(() => {
      this.obj.delete()
    })
  }
}