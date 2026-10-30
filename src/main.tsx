import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { soundEngine } from './services/soundEngine.ts'

// The first tap, click or keypress anywhere starts the audio context.
soundEngine.armAutoUnlock()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
