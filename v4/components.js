import { optimizeFavicon } from './utilities.js'

export class SaveLinksLink {
  view() {
    return m(
      'a.page-title.pointer',
      {
        target: '_blank',
        href: 'https://repl.it/@danielbom/SaveLinks',
      },
      'Save Links',
    )
  }
}

export class AccessLink {
  static fromLink(link) {
    return m(AccessLink, {
      key: link.url,
      url: link.url,
      title: link.title,
      favorite: link.favorite,
    })
  }

  oninit(vnode) {
    const { url, title, favorite } = vnode.attrs
    const optimizedUrl = optimizeFavicon(url)
    this.favicon = `https://www.google.com/s2/favicons?domain=${optimizedUrl}`
    this.titleClass = favorite ? 'link__title link__favorite' : 'link__title'
    this.title = title
    this.url = url
  }

  view() {
    return m('a.link.pointer', { target: '_blank', href: this.url }, [
      m('div.link__icon', m('img', { alt: 'icon', src: this.favicon })),
      m('div', { class: this.titleClass }, this.title),
    ])
  }
}

export class MobileHeader {
  view(vnode) {
    const { toggleMenu, menuIsOpen } = vnode.attrs
    return m('div#header', [
      m(SaveLinksLink),
      m(
        'div.menu-btn',
        {
          onclick: toggleMenu,
          class: menuIsOpen ? 'open' : undefined,
        },
        m('div.menu-btn__burger'),
      ),
    ])
  }
}

export class CategoryButton {
  view(vnode) {
    const { href, onclick, text, class: className } = vnode.attrs
    return m('a', { href }, m('div.pointer.btn', { onclick, class: className }, text))
  }
}

export class SubCategoryButton {
  view(vnode) {
    const { text, open, onclick } = vnode.attrs
    return m('div.sub-category', [
      m('div.sub-category__icon', m('div.folder')),
      m(
        'button.sub-category__title.pointer.btn',
        {
          onclick,
          class: open ? 'open' : undefined,
        },
        text,
      ),
    ])
  }
}

export class InputSearch {
  // https://mtsknn.fi/blog/how-to-debounce-events-in-mithriljs/

  constructor() {
    this.debounceSearch = {
      id: null,
      time: 1000,
    }
    this.search = ''
  }

  onInputDebounced(event, { typing, setSearch }) {
    event.redraw = false

    const search = event.target.value

    if (this.search !== '') {
      typing()
      m.redraw()
    }

    clearTimeout(this.debounceSearch.id)
    this.debounceSearch.id = setTimeout(() => {
      this.search = search
      setSearch(search)
      m.redraw()
    }, this.debounceSearch.time)
  }

  view(vnode) {
    const { hasError, typing, setSearch } = vnode.attrs
    return m(
      'div.row.input-text',
      { class: hasError ? 'input__error' : undefined },
      m('input#input-search', {
        oninput: (event) => this.onInputDebounced(event, { typing, setSearch }),
        placeholder: 'Buscar',
        type: 'text',
        spellcheck: 'false',
      }),
    )
  }
}
