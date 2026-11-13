import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

const DESIGN_WIDTH = 1920
const RESPONSIVE_WIDTH = 900

function updateViewportScale() {
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth
  const viewportHeight = window.innerHeight
  const scale = viewportWidth > RESPONSIVE_WIDTH ? viewportWidth / DESIGN_WIDTH : 1
  const style = document.documentElement.style
  style.setProperty('--app-scale', String(scale))
  style.setProperty('--app-width', `${viewportWidth / scale}px`)
  style.setProperty('--app-height', `${viewportHeight / scale}px`)
}

updateViewportScale()

export default function Root() {
  useEffect(() => {
    updateViewportScale()
    const viewport = window.visualViewport
    window.addEventListener('resize', updateViewportScale)
    viewport?.addEventListener('resize', updateViewportScale)
    return () => {
      window.removeEventListener('resize', updateViewportScale)
      viewport?.removeEventListener('resize', updateViewportScale)
    }
  }, [])

  return (
    <HashRouter>
      <App />
    </HashRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
