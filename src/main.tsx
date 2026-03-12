import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProjectsProvider } from './contexts/ProjectsContext'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

// No build para Pages, BASE_URL = /repo-name/; em dev = /
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
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
