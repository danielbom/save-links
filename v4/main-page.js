import { SaveLinksLink, MobileHeader, CategoryButton, AccessLink, InputSearch, SubCategoryButton } from './components.js'
import { stateMain } from './main-state.js'
import { enableDarkMode, slugify } from './utilities.js'

const PageMain = (() => {
  const state = stateMain

  class Sidebar {
    view() {
      return m('div#sidebar', { class: state.menuIsOpen ? undefined : 'close' }, [
        m(SaveLinksLink),
        m('div.mode', m(m.route.Link, { href: '/z' }, m('div.pointer.btn.text-blue', 'Tag Mode'))),
        m('div', m('div.pointer.btn', { onclick: state.toggleDarkMode }, state.darkOrLightMode)),
        m('div', [
          m('div.sidebar__subtitle', 'Links'),
          m('div.sidebar__group', [
            m(CategoryButton, {
              href: '#sem-categoria',
              onclick: () => state.changeToWithoutCategory(),
              text: state.withoutCategory.name,
            }),
            m(CategoryButton, {
              href: '#favoritos',
              onclick: () => state.changeToFavoriteCategory(),
              text: state.favoritesCategory.name,
            }),
          ]),
        ]),
        m('div', [
          m('div.sidebar__subtitle', 'Categorias'),
          m('div#category-add.pointer', 'Adicionar categoria (+)'),
          m(
            'div.sidebar__group',
            state.categories.map((category) =>
              m(CategoryButton, {
                href: slugify(category.name),
                onclick: () => state.changeCategory(category),
                text: category.title,
                class: 'category__title',
              }),
            ),
          ),
        ]),
        m('div#plus-tools', [
          m('div.sidebar__subtitle', 'Main'),
          m('div.sidebar__group', [m('div.pointer.btn', 'Rascunho'), m('div.pointer.btn', 'Sair')]),
        ]),
        m('div#descriptions', state.infoText),
        m('div.empty-block'),
      ])
    }
  }

  class Content {
    view() {
      return m('div#content', { class: state.menuIsOpen ? 'close' : undefined }, [
        m(InputSearch, {
          hasError: state.linksNotFoundAlert,
          typing: () => state.typing(),
          setSearch: (text) => state.setSearch(text),
        }),
        m(
          'div.row.input-search#input-add',
          m('input', {
            placeholder: 'http:// ou https://',
            type: 'text',
            spellcheck: 'false',
          }),
        ),
        m('div', state.searchLinks.map(AccessLink.fromLink)),
        m('div#category-title.row', state.currentCategory.name),
        m(
          'div.group__sub-category',
          state.currentCategory.subCategories.map((subCategory) =>
            m('div.sub-category__list', [
              m(SubCategoryButton, {
                open: subCategory.show,
                onclick: () => subCategory.toggle(),
                text: subCategory.title,
              }),
              m(
                'div.sub-category__items',
                m('div', subCategory.show ? subCategory.values.map(AccessLink.fromLink) : []),
              ),
            ]),
          ),
        ),
        m('div', state.currentCategory.values.map(AccessLink.fromLink)),
        m('div.empty-block'),
      ])
    }
  }

  class App {
    oninit() {
      App.initializeState()
      App.initializeEvents()
    }

    onremove() {
      App.removeEvents()
    }

    view() {
      return m('div#app', m('div#page', [m(MobileHeader), m(Sidebar), m(Content)]))
    }

    static initializeState() {
      state.initialize(prepareFlags())
      enableDarkMode(state.darkModeEnable)

      function updateLocalStorage() {
        const data = JSON.stringify({
          category: state.currentCategory.name,
          darkModeEnable: state.darkModeEnable,
        })
        localStorage.setItem(APP_STATE_STORE_KEY, data)
      }

      mobxStateTree.onPatch(state, (change) => {
        switch (change.path) {
          case '/darkModeEnable':
            enableDarkMode(change.value)
            updateLocalStorage()
            break
          case '/currentCategory':
            updateLocalStorage()
            break
        }
      })
    }

    static initializeEvents() {
      function handleInputSearchShortcut(event) {
        if (event.isTrusted) {
          switch (event.key) {
            case 'Escape':
              document.getElementById('input-search').blur()
              break

            case 'q':
              const el = document.getElementById('input-search')
              if (document.activeElement !== el) el.focus()
              break
          }
        }
      }

      document.addEventListener('keyup', handleInputSearchShortcut)

      App.removeEvents = () => {
        document.removeEventListener('keyup', handleInputSearchShortcut)
      }
    }
  }

  return App
})()

export default PageMain