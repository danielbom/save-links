const counterBy = (f) => (xs) =>
  xs.reduce((dict, x) => {
    const key = f(x)
    dict[key] = (dict[key] || 0) + 1
    return dict
  }, {})
const counterAll = counterBy((x) => x)

const groupBy = (f) => (xs) =>
  xs.reduce((dict, x) => {
    const key = f(x)
    dict[key] = dict[key] || []
    dict[key].push(x)
    return dict
  }, {})

const linksByCategory = groupBy((link) => link.category || 'Sem categoria')(links)
const categories = counterBy((url) => url.category)(links)
delete categories[undefined]

const subCategories = links.reduce((dict, url) => {
  if (!url.category) return dict
  const c = dict[url.category] || []
  const sc = url.subCategory || ''
  dict[url.category] = c
  if (!c.includes(sc)) c.push(sc)
  return dict
}, {})

const allSubCategories = links.map((url) => url.subCategory).filter((c) => c && c.length > 0)

const subCategoriesCount = counterAll(allSubCategories)
