function $(selector, element = document) {
  return element.querySelector(selector)
}
function $$(selector, element = document) {
  return Array.from(element.querySelectorAll(selector))
}

let time = Date.now()
const log = (...args) => {
  let newTime = Date.now()
  if (newTime - 50 > time) {
    console.log(' ')
    time = newTime
  }
  console.log(...args)
}

const isEmpty = (x) => !x || x.length === 0
const defaultTo = (value) => (x) => isEmpty(x) ? value : x
const mapDict = (dict, f) => {
  const r = []
  for (const k in dict) r[k] = f(k, dict[k])
  return r
}

const htmlStr = (x) => (typeof x === 'string' ? x : x.join('\n'))
function html(el, value) {
  el.innerHTML = htmlStr(value)
}
function on(el, event, cb) {
  el.addEventListener(event, (e) => {
    try {
      return cb(e)
    } catch (e) {
      log(`[error | on | ${event}]`)
      log(e)
    }
  })
}

function compare(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}
function compareOn(f) {
  return (a, b) => compare(f(a), f(b))
}

function hiddenEl(el) {
  el.style.display = 'none'
}

function onClick(el, cb) {
  on(el, 'click', cb)
  on(el, 'auxclick', cb)
}

function getHash() {
  return window.location.hash.slice(1)
}
function setHash(value) {
  window.location.hash = value
}
