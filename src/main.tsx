import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProjectsProvider } from './contexts/ProjectsContext'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

/** Base path para o router: no GitHub Pages é /repo-name, em dev é '' */
function getBasename(): string {
  const pathname = window.location.pathname
  if (pathname === '/' || pathname === '') return ''
  const segment = pathname.split('/').filter(Boolean)[0]
  return segment ? `/${segment}` : ''
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
