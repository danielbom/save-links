class View {
  constructor() {
    this.searchInput = $('.input__search')
    this.urlInput = $('.input__url')

    this.groupSearched = $('.group__searched')
    this.groupSubCategory = $('.group__sub-category')
    this.groupLinks = $('.group__link')

    this.title = $('.sidebar__title')
    this.sidebarLinks = $('.sidebar__links')
    this.sidebarFavorities = $('.sidebar__favorities', this.sidebarLinks)
    this.sidebarNoCategory = $('.sidebar__no-category', this.sidebarLinks)
    this.sidebarPlus = $('.sidebar__plus')
    this.sidebarAddCategory = $('.sidebar__category-add')
    this.sidebarDesc = $('.sidebar__describe')
    this.groupCategory = $('.group__category')

    this.category = $('.main__category')

    this.plus = $('.sidebar__plus')

    this.addCategory = $('.sidebar__category-add')

    this.timeoutInputKeysId = null

    this.INPUT_LENGTH_THRESHOLD = 3
  }

  setFavorite(favorite) {
    this.sidebarFavorities.innerText = favorite
  }
  setNoCategory(noCategory) {
    this.sidebarNoCategory.innerText = noCategory
  }
  setCategory(category) {
    this.category.innerText = category
  }
  setCategories(categories) {
    Util.html(
      this.groupCategory,
      Object.entries(categories)
        .sort(Util.compareOn((pair) => pair[0]))
        .map(([category, values]) => {
          return `
            <div class="btn category__select" data="${category}">
              ${category} (${values.length})
            </div>
          `
        }),
    )
  }
  setSearched(links) {
    Util.log(`[build | links | ${links.length}]`)

    Util.html(
      this.groupSearched,
      links.map((link) => this._replLink(link)),
    )
  }
  setSubCategories(subCategories, subCategoryEnables) {
    const nodes = Object.entries(subCategories)
      .sort(Util.compareOn((pair) => pair[0]))
      .map((pair) => this._replSubCategory(pair, subCategoryEnables))

    Util.log(`[build | subCategory, ${nodes.length}]`)

    Util.html(this.groupSubCategory, nodes)
  }
  setLinks(links) {
    Util.log(`[build | links | ${links.length}]`)

    Util.html(
      this.groupLinks,
      links.map((link) => this._replLink(link)),
    )
  }
  setDescription(description) {
    const div = document.createElement('div')
    div.innerText = description

    this.sidebarDesc.innerText = ''
    this.sidebarDesc.appendChild(div)
  }

  clearSearchInput() {
    this.searchInput.value = ''
  }
  clearUrlInput() {
    this.urlInput.value = ''
  }

  // command: (key: string, event: EventHTML) => void
  configureInputs(command) {
    const inputs = {
      search: this.searchInput,
      url: this.urlInput,
    }

    Object.entries(inputs).forEach(([key, el]) => {
      Util.on(el, 'keyup', (e) => {
        const data = e.target.value

        // debounce on key press
        if (e.key === 'Enter' || e.keyCode === 13) {
          command(key, data)
        } else if (data.length >= this.INPUT_LENGTH_THRESHOLD || data.length === 0) {
          if (this.timeoutInputKeysId) {
            clearTimeout(this.timeoutInputKeysId)
          }
          this.timeoutInputKeysId = setTimeout(() => {
            command(key, data)
          }, 600)
        }
      })
    })
  }
  // command: (category: string) => void
  configureCategory(command) {
    const els = $$('.category__select', this.groupCategory)
    els.forEach((el) => this._onCategoryClick(el, command))
  }
  // command: () => void
  configureFavorite(command) {
    Util.onClick(this.sidebarFavorities, () => {
      command()
    })
  }
  // command: () => void
  configureNoCategory(command) {
    Util.onClick(this.sidebarNoCategory, () => {
      command()
    })
  }
  // command: () => void
  configureTitle(command) {
    Util.onClick(this.title, () => command())
  }

  _replLink({ url, title, description, favorite }) {
    const fav = favorite ? ' link__favorite' : ''
    return `
      <a class="link" href="${url}" target="_blank">
        <div class="link__icon">
          <img src="https://www.google.com/s2/favicons?domain=${url}"
            alt="${title}">
        </div>
        <div class="link__title${fav}" data="${url}">${title}</div>
      </a>
    `
  }
  _replSubCategory([subCategory, values], enables) {
    const linksHtml = enables.has(subCategory) ? values.map((link) => this._replLink(link)) : []
    return `
      <section class="sub-category__list" data="${subCategory}">
        <div class="sub-category">
          <div class="sub-category__icon"></div>
          <button class="sub-category__title" onclick="console.log(event.target)">
            ${subCategory} (${values.length})
          </button>
        </div>
        <div class="sub-category__items">
          ${linksHtml.join('\n')}
        </div>
      </section>
    `
  }

  _onCategoryClick(el, command) {
    const category = el.getAttribute('data')

    Util.on(el, 'click', () => command(category))
  }
}
