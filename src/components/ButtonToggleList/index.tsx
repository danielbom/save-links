import clsn from '../../lib/clsn'
import './styles.css'

interface ButtonToggleListProps {
  isOpen: boolean
  onClick: () => void
}

export default function ButtonToggleList({ isOpen, onClick }: ButtonToggleListProps) {
  return (
    <button className={clsn(['menu-btn', isOpen && 'menu-btn--open'])} onClick={onClick}>
      <div className="menu-btn__burger"></div>
    </button>
  )
}
