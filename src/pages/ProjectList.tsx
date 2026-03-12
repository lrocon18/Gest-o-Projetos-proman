import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/contexts/ProjectsContext'
import { useToast } from '@/contexts/ToastContext'
import Logo from '@/components/Logo'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'
import NewProjectModal from '@/components/NewProjectModal'
import ProjectsSidebar from '@/components/ProjectsSidebar'
import type { ProjectFile } from '@/types/project'

export default function ProjectList() {
  const { projects, addProject, removeProject } = useProjects()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [projectToDelete, setProjectToDelete] = useState<ProjectFile | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      removeProject(projectToDelete.id)
      setProjectToDelete(null)
    }
  }

  const handleConfirmNewProject = (name: string) => {
    const added = addProject(name, [])
    setShowNewProjectModal(false)
    toast('Projeto criado com sucesso!', 'success')
    navigate(`/project/${added.id}`)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      <ProjectsSidebar projects={projects} onDeleteClick={setProjectToDelete} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-[var(--bdr)] bg-[var(--surf)] px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <Logo />
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto p-6">
          <h1 className="text-xl font-bold text-[var(--text)] mb-2">Escolher projeto</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Selecione um projeto na barra à esquerda para ver o dashboard ou crie um novo.
          </p>

          <section className="border border-[var(--bdr)] rounded-xl bg-[var(--surf)] p-6">
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2.5 rounded-xl font-medium bg-[#2F523E] text-white hover:bg-[#3d6b4f] dark:bg-[#2F523E] dark:hover:bg-[#3dd68c]/90"
            >
              Adicionar novo projeto
            </button>
          </section>
        </main>
      </div>

      {projectToDelete && (
        <ConfirmDeleteModal
          projectName={projectToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setProjectToDelete(null)}
        />
      )}

      {showNewProjectModal && (
        <NewProjectModal
          onConfirm={handleConfirmNewProject}
          onCancel={() => setShowNewProjectModal(false)}
        />
      )}
    </div>
  )
}
