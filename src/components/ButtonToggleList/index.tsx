import clsn from '../../lib/clsn'
import './styles.css'

interface ButtonToggleListProps {
  isOpen: boolean
  onClick: () => void
}

export default function ButtonToggleList({ isOpen, onClick }: ButtonToggleListProps) {
  return (
    <button className={clsn(['button-toggle-list', isOpen && 'button-toggle-list--open'])} onClick={onClick}>
      <div className="button-toggle-list__burger"></div>
    </button>
  )
}
