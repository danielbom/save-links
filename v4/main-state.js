const StateTreeMain = (() => {
  const { types } = mobxStateTree
  const { values } = mobx

  function linkTitleAugmentation(link) {
    const path = [link.category, link.subCategory].filter((it) => it).join(' / ')
    const augment = path.length > 0 ? `(${path}) ` : ''
    return { ...link, title: `${augment}${link.title}` }
  }

  const Link = types.model({
    url: types.identifier,
    title: types.string,
    category: types.maybeNull(types.string),
    subCategory: types.maybeNull(types.string),
    favorite: types.maybeNull(types.boolean),
  })

  const SubCategory = types
    .model({
      name: types.identifier,
      values: types.array(Link),
      show: types.boolean,
    })
    .views((self) => ({
      get title() {
        const linksCount = values(self.values).length
        return `${self.name} (${linksCount})`
      },
    }))
    .actions((self) => ({
      toggle() {
        self.show = !self.show
      },
    }))

  const Category = types
    .model({
      name: types.identifier,
      values: types.array(Link),
      subCategories: types.optional(types.array(SubCategory), []),
    })
    .views((self) => ({
      get title() {
        const subCategoriesLinksCount = sumBy(values(self.subCategories), (c) => c.values.length)
        const linksCount = values(self.values).length
        const totalLinksCount = subCategoriesLinksCount + linksCount
        return `${self.name} (${totalLinksCount})`
      },
    }))

  const Root = types
    .model({
      // fixed values
      allLinks: types.array(Link),
      favoritesCategory: types.maybeNull(Category),
      withoutCategory: types.maybeNull(Category),
      categories: types.array(Category),

      // current values
      currentCategory: types.maybeNull(types.reference(Category)),
      darkModeEnable: types.boolean,
      menuIsOpen: types.boolean,

      // search
      search: types.string,
    })
    .views((self) => ({
      get darkOrLightMode() {
        return self.darkModeEnable ? '🌔 Light Mode' : '🌒 Dark Mode'
      },

      get infoText() {
        const linksCount = values(self.allLinks).length
        const categoriesCount = values(self.categories).length
        return `${linksCount} links e ${categoriesCount} categorias`
      },

      get searchLinks() {
        if (self.search.length > 0) {
          const term = self.search.toLowerCase()
          return values(self.allLinks)
            .filter((link) => link.title.toLowerCase().includes(term))
            .map(linkTitleAugmentation)
        } else {
          return []
        }
      },

      get linksNotFoundAlert() {
        return self.search.length > 0 && self.searchLinks.length === 0
      },

      get allLinksSelected() {
        return self.currentCategory.name === self.allCategory.name
      },
    }))
    .actions((self) => ({
      initialize(flags) {
        self.categories = flags.categories
        self.favoritesCategory = {
          name: 'Favoritos',
          values: flags.favorites.map(linkTitleAugmentation),
        }
        self.withoutCategory = {
          name: 'Sem categoria',
          values: flags.withoutCategory,
        }
        self.allLinks = flags.allLinks

        const defaultCategory = self.withoutCategory
        const maybeStateCategory = flags.categories.find((c) => c.name === flags.state.category)

        self.currentCategory = (maybeStateCategory || defaultCategory).name
        self.darkModeEnable = flags.state.darkModeEnable
      },

      changeCategory(category) {
        self.currentCategory = category.name
        self.menuIsOpen = false
      },

      changeToFavoriteCategory() {
        self.changeCategory(self.favoritesCategory)
      },

      changeToNewestsCategory() {
        self.changeCategory(self.newestsCategory)
      },

      toggleMenu() {
        self.menuIsOpen = !self.menuIsOpen
      },

      toggleDarkMode() {
        self.darkModeEnable = !self.darkModeEnable
      },

      setSearch(search) {
        self.search = search
      },

      typing() {
        self.search = ''
      },
    }))

  return {
    Link,
    SubCategory,
    Category,
    Root,
  }
})()

const stateMain = StateTreeMain.Root.create({
  allLinks: [],
  categories: [],

  withoutCategory: null,
  favoritesCategory: null,

  currentCategory: null,
  darkModeEnable: true,
  menuIsOpen: false,

  search: '',
})
