class SpkModel extends EventTarget{
  constructor(url, storepath, id) {
    super()
    this.obj = new Module.__SpkModel__(url, storepath, id, __GenericObj__.objects.length)
    __GenericObj__.objects.push(this)
  }
  delete() {
    this.obj.delete()
  }
}