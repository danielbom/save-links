import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import MiniSearch from 'minisearch'
import clsn from '../../lib/clsn'
import './styles.css'

interface InputSearchRefProps {
  hasError?: boolean
}

const InputSearchRef = forwardRef<HTMLInputElement, InputSearchRefProps>(({ hasError }, ref) => {
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
})

interface InputSearchProps<T> {
  values: T[]
  fields: string[]
  onSearch: (filteredValues: T[]) => void
}

function InputSearch<T>({ values, fields, onSearch: onSearchOut }: InputSearchProps<T>) {
  const [onSearch] = useState(() => onSearchOut)
  const typingRef = useRef<number | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchNotFound, setSearchNotFound] = useState(false)
  const miniSearch = useMemo(() => {
    const miniSearch = new MiniSearch({
      fields,
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
      }
    })
    miniSearch.addAll(
      values.map((it, index) => ({
        id: index,
        ...Object.fromEntries(fields.map((field) => [field, String((it as Record<string, string>)[field]).replace(/[^a-zA-Z0-9 ]/g, '')])),
      })),
    )
    return miniSearch
  }, [fields, values])

  useEffect(() => {
    const search = (searchValue: string | undefined) => {
      onSearch([])
      setSearchNotFound(false)
      if (searchValue && searchValue.length >= 2) {
        const searchResults = miniSearch.search(searchValue)
        if (searchResults.length > 0) {
          onSearch(searchResults.map((it) => values[it.id as unknown as number]))
        } else {
          setSearchNotFound(true)
        }
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputRef.current) {
        if (document.activeElement === inputRef.current) {
          if (e.key === 'Escape') {
            e.preventDefault()
            inputRef.current.value = ""
            search('')
            inputRef.current.blur()
          } else if (e.key === 'Enter') {
            e.preventDefault()
            search(inputRef.current.value.toLowerCase())
          } else {
            clearTimeout(typingRef.current)
            typingRef.current = setTimeout(() => {
              clearTimeout(typingRef.current)
              typingRef.current = undefined
              if (inputRef.current) {
                search(inputRef.current.value.toLowerCase())
              }
            }, 500)
          }
        } else {
          if (e.key === 'q') {
            e.preventDefault()
            inputRef.current.focus()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [miniSearch, onSearch, values])

  return <InputSearchRef ref={inputRef} hasError={searchNotFound} />
}

export default InputSearch
