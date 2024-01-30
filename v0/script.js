const g = {
  search: '',
  url: '',
  category: '',
  subCategories: new Set(),
  totalLinks: links.length,
  totalCategories: Object.keys(categories).length,
}
const noCategory = links.filter((url) => !url.category).sort(compareOn((url) => url.title))
const favs = links.filter((url) => url.favorite).sort(compareOn((url) => url.title))
g.category = getHash() || storage.category.get() || 'Sem categoria'
g.search = storage.search.get() || ''

function replLink({ url, title, description, favorite }) {
  const fav = favorite ? ' link__favorite' : ''
  return `
    <div class="link">
      <div class="link__icon">
        <img src="https://www.google.com/s2/favicons?domain=${url}"
          alt="${title}">
      </div>
      <div class="link__title${fav}" data="${url}">${title}</div>
    </div>
  `
}

function searchFilter(url) {
  const regex = new RegExp(g.search, 'i')
  return g.search.length > 0 ? url.title.match(regex) : true
}

function bindInputs() {
  function search() {
    log(`[search | ${g.search}]`)
    buildSearchedEls()
  }
  function add() {
    log(`[add | (${g.search},${g.url},${g.category})]`)
    links.push({
      title: g.search,
      url: g.url,
      category: g.category,
    })
    inputs.search.value = ''
    inputs.url.value = ''
    build()
  }
  function addOrSearch() {
    if (g.search.length > 0 && g.url.length > 0) {
      add()
    } else {
      search()
    }
  }
  function onKeyup(key, el) {
    on(el, 'keyup', (e) => {
      g[key] = e.target.value
      if (e.key === 'Enter' || e.keyCode === 13) {
        log(`[change | input | ${key} | ${g[key]}]`)
        addOrSearch()
      }
    })
  }

  const inputs = {
    search: $('.input__search'),
    url: $('.input__url'),
  }
  Object.entries(inputs).forEach(([key, el]) => {
    onKeyup(key, el)
  })
  hiddenEl(inputs.url)
}

const titleEl = $('.sidebar__title')
onClick(titleEl, () => {
  const url = 'https://repl.it/@danielbom/SaveLinks'
  log(`[click | link | ${url}]`)
  window.open(url)
})

const searchedEl = $('.group__searched')
function buildSearchedEls() {
  storage.search.set(g.search)
  if (g.search.length > 0) {
    const viewLinks = links.filter((url) => url.category === g.category).filter(searchFilter)
    log(`[build | links | search | ${viewLinks.length}]`)
    html(searchedEl, viewLinks.map(replLink))
  } else {
    html(searchedEl, '')
  }
}
buildSearchedEls()

const subCategoriesEl = $('.group__sub-category')
function buildSubCategories() {
  const sc = subCategories[g.category]
  if (!sc) {
    html(subCategoriesEl, '')
    return
  }
  html(
    subCategoriesEl,
    sc.sort().map((subCategory) => {
      if (subCategory === '') return ''
      const enable = g.subCategories.has(subCategory) ? ' enable' : ''
      return `
      <div class="sub-category__list${enable}" data="${subCategory}">
        <div class="sub-category">
          <div class="sub-category__icon"></div>
          <div class="sub-category__title">
            ${subCategory} (${subCategoriesCount[subCategory]})
          </div>
        </div>
        <div class="sub-category__items"></div>
      </div>
    `
    }),
  )
  buildSubCategories()

  $$('.sub-category__list').forEach((el) => {
    const sc = el.getAttribute('data')

    if (el.classList.contains('enable')) {
      const viewLinks = links.filter((link) => link.subCategory === sc).filter(searchFilter)
      buildLinks($('.sub-category__items', el), viewLinks)
    }

    onClick($('.sub-category__title', el), () => {
      const has = g.subCategories.has(sc)
      log(`[click | subcategory | ${sc} | ${!has}]`)
      if (has) {
        g.subCategories.delete(sc)
      } else {
        g.subCategories.add(sc)
      }
      buildSubCategories()
    })
  })
}

const linksEl = $('.group__link')
function buildLinks(el, links) {
  log(`[build | links | ${links.length}]`)
  html(el, links.map(replLink))
  $$('.link__title').forEach((el) => {
    const url = el.getAttribute('data')
    onClick(el, () => {
      log(`[click | link | ${url}]`)
      window.open(url)
    })
  })
}

const sidebarLinksEl = $('.sidebar__links')
const favsEl = $('.sidebar__favorities', sidebarLinksEl)
const noCategoryEl = $('.sidebar__no-category', sidebarLinksEl)
noCategoryEl.innerText = `Sem categoria (${noCategory.length})`
favsEl.innerText = `Favoritos (${favs.length})`
on(favsEl, 'click', () => {
  const category = 'Favoritos'

  log(`[click | category | ${category}]`)
  g.category = category
  storage.category.set(category)
  build()
  categoryEl.innerText = category
})
on(noCategoryEl, 'click', () => {
  const category = null

  log(`[click | category | ${category}]`)
  g.category = category
  storage.category.set(category)
  build()
  categoryEl.innerText = 'Sem categoria'
})

const addCategoryEl = $('.sidebar__category-add')
hiddenEl(addCategoryEl)

const categoriesEl = $('.group__category')
const categoryEl = $('.main__category')
function buildCategories() {
  categoryEl.innerText = g.category
  html(
    categoriesEl,
    Object.entries(categories)
      .sort()
      .map(([category, count]) => {
        return `
      <div class="btn category__select" data="${category}">
        ${category} (${count})
      </div>`
      }),
  )
  $$('.category__select').forEach((el) => {
    const category = el.getAttribute('data')
    on(el, 'click', () => {
      log(`[click | category | ${category}]`)
      g.category = category
      storage.category.set(category)
      categoryEl.innerText = category
      setHash(g.category)
      build()
    })
  })
}

const plusEl = $('.sidebar__plus')
hiddenEl(plusEl)

const descEl = $('.sidebar__describe')
html(descEl, `<div>${g.totalLinks} links e ${g.totalCategories} categorias</div>`)

function build() {
  try {
    log('[build]')
    if (g.category === 'Favoritos') {
      buildLinks(linksEl, favs)
      html(subCategoriesEl, '')
    } else if (g.category === null) {
      buildLinks(linksEl, noCategory)
      html(subCategoriesEl, '')
    } else {
      const viewUrls = linksByCategory[g.category].filter((url) => !url.subCategory).sort(compareOn((url) => url.title))
      buildLinks(linksEl, viewUrls)
      buildSubCategories()
    }
  } catch (e) {
    log('[error | build]')
    log(e)
  }
}

bindInputs()
buildCategories()
build()
