import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { ProjectFile, ProjectRow, ProjectMeta } from '@/types/project'

const STORAGE_KEY = 'proman_projects'

interface ProjectsContextType {
  projects: ProjectFile[]
  addProject: (name: string, rows: ProjectRow[], meta?: ProjectMeta) => ProjectFile
  removeProject: (id: string) => void
  getProject: (id: string) => ProjectFile | undefined
  updateProjectRows: (projectId: string, rows: ProjectRow[]) => void
  updateProjectRow: (projectId: string, rowId: string, patch: Partial<ProjectRow>) => void
}

const ProjectsContext = createContext<ProjectsContextType | null>(null)

function loadFromStorage(): ProjectFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as ProjectFile[]
    return data.map((p) => ({
      ...p,
      rows: p.rows.map((r) => ({
        ...r,
        iniD: r.ini ? new Date(r.ini) : null,
        fimD: r.fim ? new Date(r.fim) : null,
      })),
    }))
  } catch {
    return []
  }
}

function saveToStorage(projects: ProjectFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectFile[]>(loadFromStorage)

  const persist = useCallback((next: ProjectFile[]) => {
    setProjects(next)
    saveToStorage(next)
  }, [])

  const addProject = useCallback(
    (name: string, rows: ProjectRow[], meta?: ProjectMeta): ProjectFile => {
      const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const project: ProjectFile = {
        id,
        name,
        createdAt: new Date().toISOString(),
        rows: rows.map((r) => ({
          ...r,
          iniD: r.ini ? new Date(r.ini) : null,
          fimD: r.fim ? new Date(r.fim) : null,
        })),
        ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
      }
      persist([...projects, project])
      return project
    },
    [projects, persist]
  )

  const removeProject = useCallback(
    (id: string) => {
      persist(projects.filter((p) => p.id !== id))
    },
    [projects, persist]
  )

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  )

  const updateProjectRows = useCallback(
    (projectId: string, rows: ProjectRow[]) => {
      const normalized = rows.map((r) => ({
        ...r,
        iniD: r.ini ? new Date(r.ini) : null,
        fimD: r.fim ? new Date(r.fim) : null,
      }))
      persist(
        projects.map((p) =>
          p.id === projectId ? { ...p, rows: normalized } : p
        )
      )
    },
    [projects, persist]
  )

  const updateProjectRow = useCallback(
    (projectId: string, rowId: string, patch: Partial<ProjectRow>) => {
      persist(
        projects.map((p) => {
          if (p.id !== projectId) return p
          return {
            ...p,
            rows: p.rows.map((r) => {
              if (r.id !== rowId) return r
              const next = { ...r, ...patch }
              if (patch.ini !== undefined) next.iniD = patch.ini ? new Date(patch.ini) : null
              if (patch.fim !== undefined) next.fimD = patch.fim ? new Date(patch.fim) : null
              return next
            }),
          }
        })
      )
    },
    [projects, persist]
  )

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        removeProject,
        getProject,
        updateProjectRows,
        updateProjectRow,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}
