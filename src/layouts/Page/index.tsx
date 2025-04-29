import clsn from '../../lib/clsn'
import './styles.css'

export default function Page({ children }: { children: React.ReactNode }) {
  return <div className="page">{children}</div>
}

function PageHeader({ children }: { children: React.ReactNode }) {
  return <div className="page__header">{children}</div>
}

function PageSidebar({ children, hidden }: { children?: React.ReactNode; hidden?: boolean }) {
  return <div className={clsn(['page__sidebar', hidden && 'page__sidebar--close'])}>{children}</div>
}

function PageContent({ children, hidden }: { children?: React.ReactNode; hidden?: boolean }) {
  return (
    <div className={clsn(['page__content', hidden && 'page__content--close'])}>
      {children}
      <div style={{ height: '30px' }} />
    </div>
  )
}

Page.Header = PageHeader
Page.Sidebar = PageSidebar
Page.Content = PageContent
