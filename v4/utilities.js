function optimizeFavicon(url1) {
  const parts = url1.split('/')
  if (parts.length === 0) return ''

  const head = parts[0]
  const url2 = head === 'http:' || head === 'https:' ? parts.slice(0, 3).join('/') : head

  const queryIndex = url2.indexOf('?')
  const url3 = queryIndex !== -1 ? url2.slice(0, queryIndex) : url2

  return url3.replace(/youtu\.be/, 'www.youtube.com')
}

function enableDarkMode(enabled) {
  if (enabled) {
    document.querySelector('html').classList.add('dark')
  } else {
    document.querySelector('html').classList.remove('dark')
  }
}

function slugify(text) {
  const slug = [
    ['a', /[áàâãå]/g],
    ['e', /[éèẽê]/g],
    ['i', /[ìíĩî]/g],
    ['o', /[óòõô]/g],
    ['u', /[úùũû]/g],
    ['c', /[ç]/g],
    ['n', /[ñ]/g],
    ['y', /[ýÿ]/g],
    ['-', /[ ]/g],
  ].reduce((currText, [chReplaces, letters]) => currText.replace(letters, chReplaces), text.toLowerCase())

  return '#' + slug
}

function sumBy(xs, getter) {
  return xs.reduce((acc, x) => acc + getter(x), 0)
}
