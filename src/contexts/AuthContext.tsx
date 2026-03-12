import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (user: string, password: string) => boolean
  logout: () => void
  user: string | null
}

const STORAGE_KEY = 'proman_auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored).user : null
    } catch {
      return null
    }
  })

  const login = useCallback((username: string, password: string) => {
    // Validação simples para demo: qualquer usuário + senha "proman" ou não vazia
    if (!username.trim()) return false
    const ok = password === 'proman' || password.length >= 4
    if (ok) {
      setUser(username.trim())
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: username.trim() }))
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
