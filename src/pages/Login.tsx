import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = login(user, password)
    if (ok) navigate('/', { replace: true })
    else setError('Usuário ou senha inválidos. Para demo: use qualquer usuário e senha "proman" (ou 4+ caracteres).')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <h1 className="text-center text-lg font-semibold text-[var(--text)] mb-1">
          Gestão de Projetos
        </h1>
        <p className="text-center text-sm text-[var(--muted)] mb-8">
          Acompanhamento de Projetos de Engenharia
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-[var(--text)] mb-1">
              Usuário
            </label>
            <input
              id="user"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--surf)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[#2F523E] dark:focus:ring-[#3dd68c]"
              placeholder="Seu usuário"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--surf)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[#2F523E] dark:focus:ring-[#3dd68c]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#2F523E] hover:bg-[#3d6b4f] dark:bg-[#2F523E] dark:hover:bg-[#3dd68c]/90 transition-colors"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Demo: senha <code className="bg-[var(--surf2)] px-1 rounded">proman</code> ou 4+ caracteres
        </p>
      </div>
    </div>
  )
}
