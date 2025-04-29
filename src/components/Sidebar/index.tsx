import './styles.css'

function Sidebar({ children }: { children: React.ReactNode }) {
  return <div className="sidebar">{children}</div>
}

interface SidebarGroupTitleProps {
  value: string
}

export function SidebarGroupTitle({ value }: SidebarGroupTitleProps) {
  return <div className="sidebar__subtitle">{value}</div>
}

export function SidebarGroupContent({ children }: { children?: React.ReactNode }) {
  return <div className="sidebar__group">{children}</div>
}

function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

interface SidebarGroupItemProps {
  name: string
  count: number
  href: string
  onClick?: () => void
}

function SidebarGroupItem({ name, count, href, onClick }: SidebarGroupItemProps) {
  return (
    <div className="sidebar__item" onClick={onClick}>
      <a href={href}>
        {name} ({count})
      </a>
    </div>
  )
}

Sidebar.Group = SidebarGroup
Sidebar.Title = SidebarGroupTitle
Sidebar.Content = SidebarGroupContent
Sidebar.Item = SidebarGroupItem

export default Sidebar
