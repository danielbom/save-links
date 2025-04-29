import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/animations.css'
import './css/fonts.css'
import './css/reset.css'
import './css/colors.css'
import App from './App.tsx'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
