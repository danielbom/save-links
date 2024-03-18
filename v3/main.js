function optimizeFavicon(url) {
  const parts = url.split('/')
  if (parts.length === 0) return ''

  const head = parts[0]
  if (head === 'http:' || head === 'https:') {
    return parts.slice(0, 3).join('/')
  } else {
    return head
  }
}

function enableDarkMode(enabled) {
  if (enabled) {
    document.querySelector('html').classList.add('dark')
  } else {
    document.querySelector('html').classList.remove('dark')
  }
}

const SaveLinksLink = {
  name: 'save-links-link',
  template: `
    <a
      class="page-title"
      class="pointer"
      target="_blank"
      href="https://repl.it/@danielbom/SaveLinks"
    >
      Save Links
    </a>`,
}
const AccessLink = {
  name: 'access-link',
  props: {
    url: { type: String, required: true },
    title: { type: String, required: true },
    favorite: { type: Boolean, required: true },
  },
  computed: {
    favicon() {
      const url = optimizeFavicon(this.url)
      return `https://www.google.com/s2/favicons?domain=${url}`
    },
  },
  // TODO
  template: `
    <a target="_blank" class="link" :href="url">
      <div class="link__icon">
        <img alt="icon" :src="favicon">
        <!--
          TODO: https://stackoverflow.com/questions/7995080/html-if-image-is-not-found]
          <img :alt="title" :src="favicon" onerror=...>
        -->
      </div>
      <div class="link__title" :class="{ link__favorite: favorite }">
        {{ title }}
      </div>
    </a>`,
}

Vue.createApp({
  components: {
    SaveLinksLink,
    AccessLink,
  },
  data() {
    return {
      // fixed values
      categories: [],
      favorites: [],
      withoutCategory: [],
      allLinks: [],

      // current values
      currentTitle: '',
      currentSubCategories: [],
      currentLinks: [],
      darkModeEnable: false,
      menuIsOpen: false,

      // search
      searchOnFocus: false,
      search: '',
      searchLinks: [],
      debounceSearch: {
        time: 1000,
        id: null,
      },
      searchLinksFound: true,
    }
  },
  mounted() {
    document.addEventListener('keyup', (event) => this.onKeyUp(event))

    const flags = prepareFlags()
    this.categories = flags.categories
    this.favorites = flags.favorites
    this.withoutCategory = flags.withoutCategory
    this.allLinks = flags.allLinks

    const defaultCategory = {
      name: 'Sem categoria',
      values: flags.withoutCategory,
      subCategories: [],
      selected: true,
    }
    const maybeStateCategory = flags.categories.find((c) => c.name === flags.state.category)
    const currentCategory = maybeStateCategory || defaultCategory

    this.currentLinks = currentCategory.values
    this.currentSubCategories = currentCategory.subCategories
    this.currentTitle = currentCategory.name
    this.darkModeEnable = flags.state.darkModeEnable

    enableDarkMode(this.darkModeEnable)
  },
  methods: {
    onKeyUp(event) {
      if (event.isTrusted) {
        switch (event.key) {
          case 'Escape':
            this.searchOnFocus = false
            document.getElementById('input-search').blur()
            break

          case 'q':
            const el = document.getElementById('input-search')
            if (document.activeElement !== el) el.focus()
            break
        }
      }
    },
    toggleMenu() {
      this.menuIsOpen = !this.menuIsOpen
    },
    toggleDarkMode() {
      this.darkModeEnable = !this.darkModeEnable
    },
    toggleSubCategory(subCategory) {
      subCategory.show = !subCategory.show
    },
    changeCategory(category) {
      this.search = ''
      this.currentTitle = category.name
      this.currentLinks = category.values
      this.currentSubCategories = category.subCategories
      this.menuIsOpen = false
    },
    changeToFavoriteCategory() {
      this.changeCategory({
        name: 'Favoritos',
        values: this.favorites,
        subCategories: [],
      })
    },
    changeToWithoutCategory() {
      this.changeCategory({
        name: 'Sem categoria',
        values: this.withoutCategory,
        subCategories: [],
      })
    },
    slugify(text) {
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
    },
    categoryTitle(category) {
      const subCategoryLinksCount = category.subCategories.reduce((acc, c) => acc + c.values.length, 0)
      const linksCount = category.values.length
      const totalLinksCount = subCategoryLinksCount + linksCount
      return `${category.name} (${totalLinksCount})`
    },
    subCategoryTitle(subCategory) {
      return `${subCategory.name} (${subCategory.values.length})`
    },
    searchInput(event) {
      this.searchLinksFound = true
      clearTimeout(this.debounceSearch.id)
      this.debounceSearch.id = setTimeout(() => {
        this.search = event.target.value
      }, this.debounceSearch.time)
    },
    updateLocalStorage() {
      localStorage.setItem(
        APP_STATE_STORE_KEY,
        JSON.stringify({
          category: this.currentTitle,
          darkModeEnable: this.darkModeEnable,
        }),
      )
    },
  },
  computed: {
    infoText() {
      return `${this.allLinks.length} links e ${this.categories.length} categorias`
    },
    darkOrLightMode() {
      if (this.darkModeEnable) {
        return '🌔 Light Mode'
      } else {
        return '🌒 Dark Mode'
      }
    },
  },
  watch: {
    search() {
      if (this.search.length >= 4) {
        const term = this.search.toLowerCase()
        this.searchLinks = this.allLinks.filter((link) => link.title.toLowerCase().includes(term))
        this.searchLinksFound = this.searchLinks.length > 0
      } else if (this.search.length === 0) {
        this.searchLinks = []
      }
    },
    currentTitle() {
      this.updateLocalStorage()
    },
    darkModeEnable() {
      enableDarkMode(this.darkModeEnable)
      this.updateLocalStorage()
    },
  },
  template: `
    <div id="page">
      <div id="header">
        <save-links-link></save-links-link>
        <div 
          class="menu-btn"
          v-on:click="toggleMenu"
          :class="{ open: menuIsOpen }"
        >
          <div class="menu-btn__burger"></div>
        </div>
      </div>
      <div
        id="sidebar"
        :class="{ close: !menuIsOpen }"
      >
        <save-links-link></save-links-link>
        <div>
          <div class="pointer btn" v-on:click="toggleDarkMode">
            {{ darkOrLightMode }}
          </div>
        </div>
        <div>
          <div class="sidebar__subtitle">Links</div>
          <div class="sidebar__group">
            <a href="#sem-categoria">
              <div class="pointer btn" v-on:click="changeToWithoutCategory">
                Sem categoria
              </div>
            </a>
            <a href="#favoritos">
              <div class="pointer btn" v-on:click="changeToFavoriteCategory">
                Favoritos
              </div>
            </a>
          </div>
        </div>
        <div>
          <div class="sidebar__subtitle">Categorias</div>
          <div id="category-add" class="pointer">Adicionar categoria (+)</div>
          <div class="sidebar__group">
            <a
              v-for="category in categories"
              :href="slugify(category.name)"
            >
              <div class="btn category__title" v-on:click="changeCategory(category)">
                {{ categoryTitle(category) }}
              </div>
            </a>  
          </div>
        </div>
        <div id="plus-tools">
          <div class="sidebar__subtitle">Main</div>
          <div class="sidebar__group">
            <div class="pointer btn">Rascunho</div>
            <div class="pointer btn">Sair</div>
          </div>
        </div>
        <div id="descriptions">{{ infoText }}</div>
        <div class="empty-block"></div>
      </div>
      <div id="content" :class="{ close: menuIsOpen }">
        <div 
          class="row input-text"
          :class="{ input__error: !searchLinksFound }"
        >
          <input
            v-on:input="searchInput"
            placeholder="Buscar"
            type="text"
            spellcheck="false"
            id="input-search"
          >
        </div>
        <div class="row input-search" id="input-add">
          <input placeholder="http:// ou https://" type="text" spellcheck="false">
        </div>
        <div>
          <access-link 
            v-for="link in searchLinks"
            :title="link.title"
            :url="link.url"
            :favorite="link.favorite"
          ></access-link>
        </div>
        <div class="row" id="category-title">{{ currentTitle }}</div>
        <div class="group__sub-category">
          <div 
            v-for="subCategory in currentSubCategories"
            class="sub-category__list"
          >
            <div class="sub-category">
              <div class="sub-category__icon">
                <div class="folder"></div>
              </div>
              <button 
                class="sub-category__title pointer btn"
                v-on:click="toggleSubCategory(subCategory)"
              >
                {{ subCategoryTitle(subCategory) }}
              </button>
            </div>
            <div class="sub-category__items">
              <div v-if="subCategory.show">
                <access-link 
                  v-for="link in subCategory.values"
                  :title="link.title"
                  :url="link.url"
                  :favorite="link.favorite"
                ></access-link>
              </div>
            </div>
          </div>
        </div>
        <div>
          <access-link 
            v-for="link in currentLinks"
            :title="link.title"
            :url="link.url"
            :favorite="link.favorite"
          ></access-link>
        </div>
        <div class="empty-block"></div>
      </div>
    </div>`,
}).mount('#app')
