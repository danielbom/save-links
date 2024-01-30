function $(selector, element = document) {
  return element.querySelector(selector)
}
function $$(selector, element = document) {
  return Array.from(element.querySelectorAll(selector))
}
