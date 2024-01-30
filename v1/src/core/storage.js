const Storage = (() => {
  class LocalStore {
    constructor(key) {
      this.key = key
    }
    get() {
      return JSON.parse(localStorage.getItem(this.key))
    }
    set(val) {
      localStorage.setItem(this.key, JSON.stringify(val))
    }
  }

  class Storage {
    constructor() {
      this.category = new LocalStore('category')
      this.search = new LocalStore('search')
    }
  }

  return Storage
})()
