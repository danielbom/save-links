function Store(key) {
  const s = localStorage
  return {
    key,
    get() {
      return JSON.parse(s.getItem(key))
    },
    set(val) {
      s.setItem(key, JSON.stringify(val))
    },
  }
}

const storage = {
  category: Store('category'),
  search: Store('search'),
}
