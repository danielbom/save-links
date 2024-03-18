const APP_STATE_STORE_KEY = 'app-state-links'
const DEFAULT_STATE = {
  category: '',
  darkModeEnable: false,
}

function prepareFlags() {
  function sortBy(g) {
    return function sortBy_(xs) {
      xs.sort((a, b) => {
        const x = g(a)
        const y = g(b)
        return x > y ? 1 : x < y ? -1 : 0
      })
    }
  }
  const sortByName = sortBy((x) => x.name)

  function normalizeLink(link) {
    return {
      url: link.url,
      title: link.title,
      favorite: Boolean(link.favorite),
      category: link.category || null,
      subCategory: link.subCategory || null,
      tags: link.tags,
    }
  }

  function normalizeSubCategory(links) {
    const subCategoriesMap = {}

    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      const sc = link.subCategory
      if (sc) {
        subCategoriesMap[sc] = subCategoriesMap[sc] || {
          name: sc,
          values: [],
          show: false,
        }
        subCategoriesMap[sc].values.push(normalizeLink(link))
      }
    }

    const subCategories = Object.values(subCategoriesMap)
    sortByName(subCategories)

    return subCategories
  }

  function normalizeCategory({ name, values }) {
    return {
      name,
      values: values.filter((link) => !link.subCategory).map(normalizeLink),
      subCategories: normalizeSubCategory(values),
      selected: false,
    }
  }

  function normalizeInitialData(links) {
    sortBy((x) => x.title.toLowerCase())(links)

    const categoriesMap = {}
    const withoutCategory = []
    const favorites = []
    const allLinks = links.map(normalizeLink)
    const newLinks = []

    for (let i = 0; i < links.length; i++) {
      const link = links[i]

      if (link.category) {
        categoriesMap[link.category] = categoriesMap[link.category] || {
          name: link.category,
          values: [],
        }
        categoriesMap[link.category].values.push(link)
      } else {
        withoutCategory.push(normalizeLink(link))
      }

      if (link.favorite) {
        favorites.push(normalizeLink(link))
      }
    }

    const categories = Object.values(categoriesMap).map(normalizeCategory)
    sortByName(categories)

    const stateStr = localStorage.getItem(APP_STATE_STORE_KEY)
    const state = stateStr ? JSON.parse(stateStr) : DEFAULT_STATE

    // Prevent unassigned keys
    for (const key in DEFAULT_STATE) {
      state[key] = state[key] || DEFAULT_STATE[key]
    }

    return {
      categories,
      withoutCategory,
      favorites,
      allLinks,
      newLinks,
      state,
    }
  }

  return normalizeInitialData(links)
}
