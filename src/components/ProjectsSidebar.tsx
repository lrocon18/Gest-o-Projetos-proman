import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { ProjectFile } from '@/types/project'

interface ProjectsSidebarProps {
  projects: ProjectFile[]
  onDeleteClick: (project: ProjectFile) => void
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default function ProjectsSidebar({ projects, onDeleteClick }: ProjectsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    setShowLogout(false)
    logout()
  }

  return (
    <aside
      className={`flex flex-col border-r border-[var(--bdr)] bg-[var(--surf)] transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-64 min-w-[16rem]'
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-[var(--bdr)] min-h-[52px]">
        {!collapsed && (
          <span className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider truncate">
            Projetos
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-lg hover:bg-[var(--surf2)] text-[var(--muted)] flex-shrink-0"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {projects.length === 0 && !collapsed && (
          <p className="text-xs text-[var(--muted)] px-2 py-4">Nenhum projeto ainda.</p>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className={`group flex items-center gap-2 rounded-lg transition-colors ${
              collapsed ? 'justify-center p-2' : 'px-3 py-2'
            }`}
          >
            <button
              type="button"
              onClick={() => navigate(`/project/${p.id}`)}
              className={`flex-1 min-w-0 text-left rounded-lg hover:bg-[var(--surf2)] transition-colors ${
                collapsed ? 'flex justify-center' : ''
              }`}
            >
              {collapsed ? (
                <span className="text-lg font-bold text-[var(--text)]" title={p.name}>
                  {p.name.charAt(0)}
                </span>
              ) : (
                <>
                  <span className="block font-medium text-[var(--text)] truncate text-sm">
                    {p.name}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">{p.rows.length} itens</span>
                </>
              )}
            </button>
            {!collapsed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteClick(p)
                }}
                className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 hover:text-red-600 flex-shrink-0"
                aria-label={`Apagar projeto ${p.name}`}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--bdr)] p-3 mt-auto flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setShowLogout((s) => !s)}
          className={`flex items-center gap-2 rounded-lg hover:bg-[var(--surf2)] text-[var(--text)] transition-colors ${
            collapsed ? 'justify-center p-2 w-full' : 'px-3 py-2 min-w-0'
          }`}
          aria-label={showLogout ? 'Ocultar botão Sair' : 'Exibir botão Sair'}
        >
          <UserIcon className="w-5 h-5 flex-shrink-0 text-[var(--muted)]" />
          {!collapsed && (
            <span className="truncate text-sm text-[var(--muted)]">{user || 'Usuário'}</span>
          )}
        </button>
        {showLogout && (
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-[var(--bdr)] text-[var(--muted)] text-sm hover:bg-[var(--surf2)] hover:text-[var(--text)] flex-shrink-0"
          >
            Sair
          </button>
        )}
      </div>
    </aside>
  )
}
