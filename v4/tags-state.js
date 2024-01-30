const StateTreeTags = (() => {
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
    tags: types.array(types.string),
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
      categories: types.array(Category),
      allTags: types.array(types.string),

      // current values
      darkModeEnable: types.boolean,
      menuIsOpen: types.boolean,
      selectedTags: types.array(types.string),

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

      get linksByTags() {
        const selectedTags = values(self.selectedTags)
        const searchLinks = self.searchLinks
        const links = searchLinks.length > 0 ? searchLinks : values(self.allLinks)
        if (selectedTags.length > 0) {
          return links.filter((it) => selectedTags.every((tag) => it.tags.includes(tag)))
        } else if (links.length > 0) {
          return links
        } else {
          return links
        }
      },
    }))
    .actions((self) => ({
      initialize(flags) {
        const addDefaultTags = (it) => ({ ...it, tags: it.tags || ['Anything'] })
        const allLinks = flags.allLinks.map(addDefaultTags)
        const allTags = Array.from(new Set(allLinks.flatMap((it) => it.tags)))
        const withoutCategory = {
          name: 'Anything',
          values: flags.withoutCategory.map(addDefaultTags),
          subCategories: [],
        }

        self.allTags = allTags
        self.categories = flags.categories.concat([withoutCategory]).sort((a, b) => (a.name > b.name ? 1 : -1))
        self.allLinks = allLinks
        self.darkModeEnable = flags.state.darkModeEnable
      },

      changeCategory(category) {
        if (self.selectedTags.includes(category.name)) {
          self.selectedTags = []
        } else {
          self.selectedTags = [category.name]
        }
        self.menuIsOpen = false
      },

      toggleMenu() {
        self.menuIsOpen = !self.menuIsOpen
      },

      toggleDarkMode() {
        self.darkModeEnable = !self.darkModeEnable
      },

      toggleTag(tag) {
        const tags = values(self.selectedTags)
        if (tags.includes(tag)) {
          self.selectedTags = tags.filter((it) => it !== tag)
        } else {
          self.selectedTags = tags.concat([tag])
        }
      },

      clearTags() {
        self.selectedTags = []
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

const stateTags = StateTreeTags.Root.create({
  allLinks: [],
  allTags: [],

  categories: [],
  tags: [],

  darkModeEnable: true,
  menuIsOpen: false,
  selectedTags: [],

  search: '',
})
