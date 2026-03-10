import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './app/App'
import './shared/styles/global.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (rootElement.innerHTML.trim().length > 0) {
  hydrateRoot(rootElement, app)
} else {
  createRoot(rootElement).render(app)
}
