class Util {
  static log_(...args) {
    const time = new Date()
    const stime = time.toISOString().slice(11, 23)

    const scount = Util.counter.toString().padStart(5, '0')

    if (time.getTime() - 50 > Util.time.getTime()) {
      console.log('.')
      Util.time = time
    }

    console.log(`${scount} [event @ ${stime}]`, ...args)
    Util.counter++
  }

  static isEmpty(x) {
    return !x || x.length === 0
  }
  static defaultTo(value, x) {
    return Util.isEmpty(x) ? value : x
  }
  static mapDict(dict1, f) {
    const dict2 = []
    for (const key in dict1) {
      dict2[key] = f(key, dict1[key])
    }
    return dict2
  }

  static htmlStr(x) {
    return typeof x === 'string' ? x : x.join('\n')
  }
  static html(el, value) {
    el.innerHTML = Util.htmlStr(value)
  }

  static on(el, event, cb) {
    el.addEventListener(event, (e) => {
      try {
        return cb(e)
      } catch (e) {
        Util.log(`[error | on | ${event}]`)
        console.log(e)
      }
    })
  }

  static compare(a, b) {
    return a > b ? 1 : a < b ? -1 : 0
  }
  static compareOn(f) {
    return (a, b) => Util.compare(f(a), f(b))
  }

  static hiddenEl(el) {
    el.style.display = 'none'
  }

  static onClick(el, cb) {
    Util.on(el, 'click', cb)
    Util.on(el, 'auxclick', cb)
  }

  static getHash() {
    return window.location.hash.slice(1)
  }
  static setHash(value) {
    window.location.hash = value
  }

  static getParam(key) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(key)
  }

  static groupBy(f, xs) {
    return xs.reduce((dict, x) => {
      const key = f(x)
      dict[key] = dict[key] || []
      dict[key].push(x)
      return dict
    }, {})
  }

  static delegate(eventName, className, cb) {
    const checkTarget = (target) => target && target.classList && target.classList.contains(className)

    document.addEventListener(eventName, (event) => {
      let { target } = event
      let search = true

      if (!checkTarget(target)) {
        while (target && search) {
          target = target.parentNode
          if (checkTarget(target)) {
            search = false
          }
        }
      }

      if (checkTarget(target)) {
        cb.call(target, event)
      }
    })
  }

  static disableLog() {
    Util.log = () => {}
  }
}

Util.time = new Date()
Util.counter = 0
Util.log = Util.log_
