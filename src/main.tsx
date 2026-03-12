import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProjectsProvider } from './contexts/ProjectsContext'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

// Basename em runtime: no Pages é /primeiro-segmento (ex: /Gest-o-Projetos-proman), em dev é ''
function getBasename(): string {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  if (!pathname || pathname === '/') return ''
  const parts = pathname.split('/').filter(Boolean)
  return parts.length > 0 ? `/${parts[0]}` : ''
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <ThemeProvider>
        <AuthProvider>
          <ProjectsProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ProjectsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
