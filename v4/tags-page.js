const PageTags = (() => {
  const state = stateTags

  class Sidebar {
    view() {
      return m('div#sidebar', { class: state.menuIsOpen ? undefined : 'close' }, [
        m(SaveLinksLink),
        m('div.mode', [m(m.route.Link, { href: '/' }, m('div.pointer.btn.text-blue', 'Category Mode'))]),
        m('div', [m('div.pointer.btn', { onclick: state.toggleDarkMode }, state.darkOrLightMode)]),
        m('div', [
          m('div.sidebar__subtitle', 'Categorias'),
          m('div#category-add.pointer', 'Adicionar categoria (+)'),
          m(
            'div.sidebar__group',
            state.categories.map((category) =>
              m(CategoryButton, {
                onclick: () => state.changeCategory(category),
                text: category.name,
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
    oninit() {
      document.addEventListener('click', this.toggleTag)
    }

    onremove() {
      document.removeEventListener('click', this.toggleTag)
    }

    toggleTag(event) {
      const chip = [event.target, event.target.parentNode].find((it) => it.classList.contains('chip'))
      if (!chip) return
      const tag = chip.getAttribute('data')
      if (!tag) return
      state.toggleTag(tag)
      m.redraw()
    }

    view() {
      const links = state.linksByTags
      const tags = Array.from(new Set(links.flatMap((it) => it.tags)))

      return m('div#content', { class: state.menuIsOpen ? 'close' : undefined }, [
        m(InputSearch, {
          hasError: state.linksNotFoundAlert,
          typing: () => state.typing(),
          setSearch: (text) => state.setSearch(text),
        }),
        m(
          'div#tags',
          m('div.chips__container', [
            m('div.chip.chip__clear', { onclick: () => state.clearTags() }, m('span.chip__text', 'X')),
            ...tags.map((tag) =>
              m(
                'div.chip',
                { class: state.selectedTags.includes(tag) ? 'active' : undefined, data: tag },
                m('span.chip__text', tag),
              ),
            ),
          ]),
        ),
        m('div', links.map(AccessLink.fromLink)),
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
