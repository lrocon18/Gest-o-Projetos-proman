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
    const ok = username.trim() === 'Admin' && password === 'Admin@10'
    if (ok) {
      setUser('Admin')
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: 'Admin' }))
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
