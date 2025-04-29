/* eslint-disable @typescript-eslint/no-non-null-assertion */
import linksRaw from './links.md?raw'

import parseMarkdown from './parseMarkdown'
import groupBy from '../lib/groupBy'
import slugify from '../lib/slugify'

export const links = parseMarkdown(linksRaw)
export const categoriesGroups = groupBy(links, {
  key: (x) => x.category,
  of: (x) => ({ title: x.category!, slug: slugify(x.category!), links: [] as (typeof x)[] }),
  append: (g, x) => g.links.push(x),
}).map((c) => ({
  title: c.title,
  slug: c.slug,
  count: c.links.length,
  links: c.links.filter((it) => !it.subCategory),
  subCategories: groupBy(c.links, {
    key: (x) => x.subCategory,
    of: (x) => ({ name: x.subCategory!, links: [] as (typeof x)[] }),
    append: (g, x) => g.links.push(x),
  }),
}))
export const favorites = links.filter((it) => it.favorite)
export const withoutCategory = links.filter((it) => !it.category)
