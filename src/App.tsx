import { useEffect, useMemo, useState } from 'react'

import { DataItem } from './data/parseMarkdown.ts'

import slugify from './lib/slugify'

import Page from './layouts/Page'

import ButtonToggleDarkMode from './components/ButtonToggleDarkMode'
import ButtonToggleList from './components/ButtonToggleList'
import Content from './components/Content'
import DescriptionLinks from './components/DescrptionLinks'
import InputSearch from './components/InputSearch'
import PageTitle from './components/PageTitle'
import Sidebar from './components/Sidebar'

type Item = DataItem
interface Group {
  title: string
  slug: string
  count: number
  links: Item[]
  subCategories: {
    name: string
    links: Item[]
  }[]
}

function App() {
  const [links, setLinks] = useState<Item[]>([])
  const [favorites, setFavorites] = useState<Item[]>([])
  const [withoutCategory, setWithoutCategory] = useState<Item[]>([])
  const [categoriesGroups, setCategoryGroups] = useState<Group[]>([])

  const [slug, setSlug] = useState('')
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false)
  const [groupVisible, setGroupVisible] = useState<Record<string, boolean>>({})
  const [searchLinks, setSearchLinks] = useState([] as typeof links)
  const state = useMemo(() => {
    if (slug === '#sem-categoria') {
      return { title: 'Sem categoria', links: withoutCategory, subCategories: [] }
    } else if (slug === '#favoritos') {
      return { title: 'Favoritos', links: favorites, subCategories: [] }
    } else {
      const category = categoriesGroups.find((it) => it.slug === slug)
      return category ?? { title: '', links: [], subCategories: [] }
    }
  }, [slug, categoriesGroups, favorites, withoutCategory])

  const updateSlug = (newSlug: string) => {
    setSlug(newSlug)
    setSidebarIsOpen(false)
    window.history.pushState({}, '', newSlug)
  }

  useEffect(() => {
    document.title = state.title === '' ? 'Save Links' : `Save Links - ${state.title}`
  }, [state.title])

  useEffect(() => {
    const handlePopState = () => {
      setSlug(window.location.hash)
    }
    handlePopState()

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    import('./data/links.ts')
      .then((m) => {
        setLinks(m.links)
        setCategoryGroups(m.categoriesGroups)
        setFavorites(m.favorites)
        setWithoutCategory(m.withoutCategory)
      })
      .catch((e: unknown) => {
        console.error('fail to load links:', e)
      })
  }, [])

  return (
    <Page>
      <Page.Header>
        <PageTitle />
        <ButtonToggleList
          isOpen={sidebarIsOpen}
          onClick={() => {
            setSidebarIsOpen((it) => !it)
          }}
        />
      </Page.Header>
      <Page.Sidebar hidden={!sidebarIsOpen}>
        <Sidebar>
          <PageTitle />
          <ButtonToggleDarkMode />
          {(withoutCategory.length > 0 || favorites.length > 0) && (
            <Sidebar.Group>
              <Sidebar.Title value="Links" />
              <Sidebar.Content>
                {favorites.length > 0 && (
                  <Sidebar.Item
                    name="Favoritos"
                    count={favorites.length}
                    href="#favoritos"
                    onClick={() => {
                      updateSlug(slugify('Favoritos'))
                    }}
                  />
                )}
                {withoutCategory.length > 0 && (
                  <Sidebar.Item
                    name="Sem categoria"
                    count={withoutCategory.length}
                    href="#sem-categoria"
                    onClick={() => {
                      updateSlug(slugify('Sem categoria'))
                    }}
                  />
                )}
              </Sidebar.Content>
            </Sidebar.Group>
          )}
          <Sidebar.Group>
            <Sidebar.Title value="Categorias" />
            <Sidebar.Content>
              {categoriesGroups.map((group) => (
                <Sidebar.Item
                  key={group.title}
                  name={group.title}
                  count={group.count}
                  href={group.slug}
                  onClick={() => {
                    updateSlug(group.slug)
                  }}
                />
              ))}
            </Sidebar.Content>
          </Sidebar.Group>
          <DescriptionLinks categoriesCount={categoriesGroups.length} linksCount={links.length} />
        </Sidebar>
      </Page.Sidebar>
      <Page.Content hidden={sidebarIsOpen}>
        <Content>
          <InputSearch values={links} fields={['title']} onSearch={setSearchLinks} />
          <Content.List links={searchLinks} group="Pesquisa" />
          {searchLinks.length === 0 && (
            <>
              <Content.Title value={state.title} />
              {state.subCategories.map((it) => (
                <Content.Group
                  name={it.name}
                  key={it.name}
                  count={it.links.length}
                  onClick={() => {
                    setGroupVisible((prev) => ({ ...prev, [it.name]: !prev[it.name] }))
                  }}
                >
                  <Content.List group={it.name} links={it.links} visible={groupVisible[it.name] ?? false} />
                </Content.Group>
              ))}
              <Content.List links={state.links} />
            </>
          )}
        </Content>
      </Page.Content>
    </Page>
  )
}

export default App
