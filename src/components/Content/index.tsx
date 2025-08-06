import clsn from '../../lib/clsn'
import './styles.css'

export default function Content({ children }: { children: React.ReactNode }) {
  return <div className="content">{children}</div>
}

Content.Title = ContentTitle
Content.List = ContentList
Content.Group = ContentGroup

function ContentTitle({ value }: { value: string }) {
  return <h1 className="content__title">{value}</h1>
}

interface ContentGroupsProps {
  name: string
  count: number
  children: React.ReactNode
  onClick?: () => void
}

function ContentGroup({ name, count, children, onClick }: ContentGroupsProps) {
  return (
    <div className="content__group">
      <button type="button" className="content__group-title" onClick={onClick}>
        <div className="content__group-icon" />
        {name} ({count})
      </button>
      {children}
    </div>
  )
}

interface ListItemProps {
  url: string
  title: string
  favorite: boolean
}

interface ListLinksProps {
  group?: string
  className?: string
  links: ListItemProps[]
  visible?: boolean
}

function ContentList({ group, visible = true, className, links }: ListLinksProps) {
  const makeKey = (link: ListItemProps) => (group ? `${group}::${link.url}` : link.url)
  return (
    <div className={className} style={{ display: visible ? 'block' : 'none' }}>
      {links.map((link) => (
        <ListItem key={makeKey(link)} url={link.url} title={link.title} favorite={link.favorite} />
      ))}
    </div>
  )
}

function ListItem({ url, title, favorite }: ListItemProps) {
  const optimizedUrl = optimizeFavicon(url)
  return (
    <li className="link">
      <div className="link__icon">
        <img alt="icon" src={`https://www.google.com/s2/favicons?domain=${optimizedUrl}`} />
      </div>
      <a target="_blank" href={url} className={clsn([`link__title`, favorite && 'link__favorite'])}>
        {title}
      </a>
    </li>
  )
}

function optimizeFavicon(url: string) {
  try {
    const domain = new URL(url).hostname
    if (domain === 'youtu.be') return 'www.youtube.com'
    return domain
      .replace(/^www.m./, 'www.') // remove 'm.' for mobile sites
      .replace(/^www.app./, 'www.') // remove 'app.' for app sites
      .replace(/^www.web./, 'www.') // remove 'web.' for web sites
      .replace(/^www.mobile./, 'www.') // remove 'mobile.' for mobile sites
      .replace(/^www.secure./, 'www.') // remove 'secure.' for secure sites
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return ''
  }
}
