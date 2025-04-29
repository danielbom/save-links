import clsn from '../../lib/clsn'
import './styles.css'

interface InputSearchRefProps {
  hasError?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export default function InputSearchBase({ hasError, ref }: InputSearchRefProps) {
  return (
    <div className="input-saerch-container">
      <input
        ref={ref}
        type="text"
        className={clsn(['input-search', hasError && 'input-search--error'])}
        spellCheck="false"
        placeholder="Buscar"
      />
    </div>
  )
}
