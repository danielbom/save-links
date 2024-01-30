class Business {
  constructor({ storage, view, links }) {
    this.storage = storage
    this.view = view
    this.links = links.sort(Util.compareOn((link) => link.title))

    this.linksByCategory = Util.groupBy((link) => link.category || null, links)
    this.subCategoryEnable = new Set()
    this.linksBySubCategory = {}

    this.favs = links.filter((link) => link.favorite)
    this.noCategory = links.filter((link) => !link.category)

    this.category = ''
  }

  static initialize(...args) {
    const instance = new Business(...args)
    instance._init()
    return instance
  }

  _init() {
    this.startup()

    this.onClickSubCategory()

    this.view.configureTitle(this.onClickTitle())

    this.view.configureFavorite(this.onClickFavorite())
    this.view.configureNoCategory(this.onClickNoCategory())

    this.view.configureInputs(this.onInputChange())
    this.view.configureCategory(this.onCategoryChange())

    Util.hiddenEl(this.view.urlInput)
    Util.hiddenEl(this.view.plus)
    Util.hiddenEl(this.view.addCategory)
  }

  onClickSubCategory() {
    const ctx = this
    function onClickSubCategory() {
      const subCategory = this.parentElement.getAttribute('data')
      if (ctx.subCategoryEnable.has(subCategory)) {
        ctx.subCategoryEnable.delete(subCategory)
      } else {
        ctx.subCategoryEnable.add(subCategory)
      }
      ctx.view.setSubCategories(ctx.linksBySubCategory, ctx.subCategoryEnable)
    }

    Util.delegate('click', 'sub-category', onClickSubCategory)
  }

  startup() {
    this.view.setFavorite(`Favoritos (${this.favs.length})`)
    this.view.setNoCategory(`Sem categoria (${this.noCategory.length})`)

    const categories = { ...this.linksByCategory }
    delete categories[null]

    this.view.setCategories(categories)
    this.view.setSearched([])

    const linksCount = this.links.length
    const categoryCount = Object.keys(this.linksByCategory).length - 1
    this.view.setDescription(`${linksCount} links e ${categoryCount} categorias`)

    const category = this.storage.category.get()
    if (this.linksByCategory[category]) {
      this.onCategoryChange()(category)
    } else {
    }
  }

  onClickTitle() {
    const url = 'https://repl.it/@danielbom/SaveLinks'
    return () => {
      Util.log(`[click | link | ${url}]`)
      window.open(url)
    }
  }

  onClickFavorite() {
    const scategory = 'Favoritos'
    return () => {
      if (this.category === scategory) return
      this.category = scategory

      Util.setHash(scategory.replace(/\W/g, '_'))
      Util.log(`[click | category | ${scategory}]`)
      this.view.setCategory(scategory)
      this.view.setSubCategories({})
      this.view.setLinks(this.favs)
    }
  }
  onClickNoCategory() {
    const scategory = 'Sem categoria'
    return () => {
      if (this.category === scategory) return
      this.category = scategory

      Util.setHash(scategory.replace(/\W/g, '_'))
      Util.log(`[click | category | ${scategory}]`)
      this.view.setCategory(scategory)
      this.view.setSubCategories({})
      this.view.setLinks(this.noCategory)
    }
  }

  onInputChange() {
    function searchFilter(search) {
      const regex = new RegExp(search, 'i')
      return (url) => url.title.match(regex)
    }
    function searchMap(url) {
      if (url.subCategory) {
        return { ...url, title: `[${url.category} | ${url.subCategory}] ${url.title}` }
      } else if (url.category) {
        return { ...url, title: `[${url.category}] ${url.title}` }
      } else {
        return url
      }
    }

    return (key, value) => {
      if (value.length === 0) {
        this.view.setSearched([])
        return
      }

      switch (key) {
        case 'search':
          const links = this.links
            .filter(searchFilter(value))
            .map(searchMap)
            .sort(Util.compareOn((x) => x.title))

          this.view.setSearched(links)
          break
      }
    }
  }
  onCategoryChange() {
    return (category) => {
      if (this.category === category) return
      this.category = category
      this.storage.category.set(category)

      const scategory = category || 'Sem categoria'
      Util.log(`[click | category | ${scategory}]`)
      const links = this.linksByCategory[category]

      this.view.setCategory(scategory)
      Util.setHash(scategory.replace(/\W/g, '_'))

      this.subCategoryEnable = new Set()
      this.linksBySubCategory = Util.groupBy((link) => link.subCategory, links)
      delete this.linksBySubCategory[undefined]
      this.view.setSubCategories(this.linksBySubCategory, this.subCategoryEnable)

      this.view.setLinks(links.filter((link) => !link.subCategory))
    }
  }
}
