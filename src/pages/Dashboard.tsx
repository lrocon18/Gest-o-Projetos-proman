import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '@/contexts/ProjectsContext'
import Logo from '@/components/Logo'
import KpiGrid from '@/components/Dashboard/KpiGrid'
import StatusDonut from '@/components/Dashboard/StatusDonut'
import DiasBarChart from '@/components/Dashboard/DiasBarChart'
import GanttChart from '@/components/Dashboard/GanttChart'
import ProjectCards from '@/components/Dashboard/ProjectCards'
import EditProjectDrawer from '@/components/Dashboard/EditProjectDrawer'
import type { ProjectRow } from '@/types/project'

type StatusFilter = 'todos' | ProjectRow['status']

export default function Dashboard() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { getProject, updateProjectRow } = useProjects()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)

  const project = projectId ? getProject(projectId) : null
  const allRows = project?.rows ?? []
  const rows = useMemo(() => {
    if (statusFilter === 'todos') return allRows
    return allRows.filter((r) => r.status === statusFilter)
  }, [allRows, statusFilter])

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
        <p className="text-[var(--muted)] mb-4">Projeto não encontrado.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-[#2F523E] text-white"
        >
          Voltar aos projetos
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--bdr)] bg-[var(--surf)] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[var(--muted)] hover:text-[var(--text)] p-1 rounded"
              aria-label="Voltar"
            >
              ←
            </button>
            <Logo />
            <div className="border-l border-[var(--bdr)] pl-3">
              <h1 className="font-bold text-[var(--text)]">
                {project.meta?.titulo || project.name}
              </h1>
              <p className="text-xs text-[var(--muted)]">
                {project.meta?.responsavelProjeto
                  ? `Responsável: ${project.meta.responsavelProjeto}`
                  : 'Acompanhamento de Projetos de Engenharia'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditDrawerOpen(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--surf2)] text-[var(--text)] hover:bg-[var(--bdr)]/50"
          >
            Editar projeto
          </button>
        </div>
      </header>

      <div className="border-b border-[var(--bdr)] bg-[var(--surf2)] px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--muted)] w-full sm:w-auto">Filtrar por status:</span>
        {(['todos', 'Em andamento', 'Em espera', 'Não iniciado', 'Concluído'] as const).map(
          (s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--orange)] text-black border-[var(--orange)] font-bold'
                  : 'border-[var(--bdr)] bg-[var(--surf)] text-[var(--muted)] hover:bg-[var(--bdr)]'
              }`}
            >
              {s === 'todos' ? 'Todos' : s}
            </button>
          )
        )}
      </div>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-12">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
          Visão Geral
        </div>
        <KpiGrid rows={rows} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-4">
            <h3 className="font-bold text-[var(--text)]">Status dos Projetos</h3>
            <p className="text-xs text-[var(--muted)] mb-2">Distribuição por situação</p>
            <StatusDonut rows={rows} />
          </div>
          <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-4">
            <h3 className="font-bold text-[var(--text)]">Dias Trabalhados</h3>
            <p className="text-xs text-[var(--muted)] mb-2">RDOs por projeto</p>
            <DiasBarChart rows={rows} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-4 mb-6">
          <h3 className="font-bold text-[var(--text)]">Timeline — Gantt</h3>
          <p className="text-xs text-[var(--muted)] mb-2">
            Linha vermelha = hoje
          </p>
          <GanttChart rows={allRows} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Projetos
          </span>
          <span className="text-xs bg-[var(--surf2)] border border-[var(--bdr)] text-[var(--blue)] px-2 py-0.5 rounded font-semibold">
            {rows.length} projeto{rows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ProjectCards rows={rows} />
      </main>

      <EditProjectDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        projectId={project.id}
        projectName={project.meta?.titulo || project.name}
        rows={allRows}
        onUpdateRow={updateProjectRow}
      />
    </div>
  )
}
