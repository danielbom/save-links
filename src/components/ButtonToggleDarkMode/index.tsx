import { useEffect, useState } from 'react'
import './styles.css'

const DARK_MODE_KEY = 'save-links:darkMode'

export default function ButtonToggleDarkMode() {
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem(DARK_MODE_KEY)
    if (darkMode) {
      setDarkModeEnabled(true)
    }
  }, [])

  useEffect(() => {
    if (darkModeEnabled) {
      localStorage.setItem(DARK_MODE_KEY, 'true')
      document.body.classList.add('dark')
    } else {
      localStorage.removeItem(DARK_MODE_KEY)
      document.body.classList.remove('dark')
    }
  }, [darkModeEnabled])

  return (
    <button
      className="button-toggle-dark-mode"
      onClick={() => {
        setDarkModeEnabled((prev) => !prev)
      }}
    >
      {darkModeEnabled ? '🌔 Light Mode' : '🌒 Dark Mode'}
    </button>
  )
}
