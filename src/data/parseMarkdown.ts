export interface DataItem {
  readonly title: string
  readonly url: string
  readonly favorite: boolean
  readonly category: string | null
  readonly subCategory: string | null
  readonly note: string | null
}

export function parseMarkdown0(md: string): DataItem[] {
  let category: string | null = null
  let subCategory: string | null = null

  const links: DataItem[] = []
  md.split('\n').forEach((line) => {
    line = line.trim()
    if (line.length === 0) return
    if (line.startsWith('//')) return
    if (line.startsWith('# ')) {
      category = line.slice(2)
      subCategory = null
    } else if (line.startsWith('## ')) {
      subCategory = line.slice(3)
    } else if (line.startsWith('- ')) {
      let link = line.slice(2)
      let favorite = false
      let note = null
      if (link.startsWith(':star: ')) {
        favorite = true
        link = link.slice(7)
      }
      let index = 0
      if (!link.startsWith('[')) {
        index = link.indexOf('[')
        note = link.slice(0, index).trim()
        link = link.slice(index)
      }
      index = link.indexOf('](')
      const title = link.slice(1, index)
      const url = link.slice(index + 2, -1)
      links.push({
        category,
        subCategory,
        title,
        url,
        favorite,
        note,
      })
    }
  })
  return links
}

export function parseMarkdown1(md: string): DataItem[] {
  let category: string | null = null
  let subCategories: string[] = []

  const links: DataItem[] = []
  md.split('\n').forEach((line) => {
    line = line.trim()
    if (line.length === 0) return
    if (line.startsWith('//')) return
    if (line.startsWith('# ')) {
      category = line.slice(2)
      subCategories = []
    } else if (line.startsWith('## ')) {
      subCategories = line
        .slice(3)
        .split(',')
        .map((it) => it.trim())
    } else if (line.startsWith('- ')) {
      let link = line.slice(2)
      let favorite = false
      let note = null
      if (link.startsWith(':star: ')) {
        favorite = true
        link = link.slice(7)
      }
      let index = 0
      if (!link.startsWith('[')) {
        index = link.indexOf('[')
        note = link.slice(0, index).trim()
        link = link.slice(index)
      }
      index = link.indexOf('](')
      const title = link.slice(1, index)
      const url = link.slice(index + 2, -1)
      ;(subCategories.length === 0 ? [null] : subCategories).forEach((subCategory) => {
        links.push({
          category,
          subCategory,
          title,
          url,
          favorite,
          note,
        })
      })
    }
  })
  return links
}

export default parseMarkdown1
