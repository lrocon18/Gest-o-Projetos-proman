import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/contexts/ProjectsContext'
import { useToast } from '@/contexts/ToastContext'
import Logo from '@/components/Logo'
import ConfirmUploadModal from '@/components/ConfirmUploadModal'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal'
import NameProjectModal from '@/components/NameProjectModal'
import LoadingOverlay from '@/components/LoadingOverlay'
import ProjectsSidebar from '@/components/ProjectsSidebar'
import { analyzeXlsx } from '@/services/analyzeXlsx'
import type { ProjectFile } from '@/types/project'

export default function ProjectList() {
  const { projects, addProject, removeProject } = useProjects()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [uploadError, setUploadError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showLoading, setShowLoading] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectFile | null>(null)
  const [pendingProject, setPendingProject] = useState<ProjectFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    setUploadError('')
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('Envie um arquivo Excel (.xlsx ou .xls).')
      return
    }
    setSelectedFile(file)
  }

  const handleConfirmAnalysis = async () => {
    if (!selectedFile) return
    setSelectedFile(null)
    setShowLoading(true)
    setUploadError('')
    try {
      const result = await analyzeXlsx(selectedFile)
      if (!result.ok) {
        toast(result.message || 'Algo aconteceu de errado, tente novamente!', 'error')
        return
      }
      if (result.projects.length === 0) {
        toast('Algo aconteceu de errado, tente novamente!', 'error')
        return
      }
      const single = result.projects[0]
      setPendingProject({
        ...single,
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      })
    } catch {
      toast('Algo aconteceu de errado, tente novamente!', 'error')
    } finally {
      setShowLoading(false)
    }
  }

  const handleCancelAnalysis = () => {
    setSelectedFile(null)
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      removeProject(projectToDelete.id)
      setProjectToDelete(null)
    }
  }

  const handleConfirmProjectName = (projectName: string) => {
    if (!pendingProject) return
    const added = addProject(projectName, pendingProject.rows, pendingProject.meta)
    setPendingProject(null)
    toast('Projeto adicionado com sucesso!', 'success')
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
            Selecione um projeto na barra à esquerda para ver o dashboard ou adicione um novo
            enviando um arquivo XLSX no padrão esperado (colunas B a I).
          </p>

          <section className="border border-[var(--bdr)] rounded-xl bg-[var(--surf)] p-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
              Adicionar projeto (XLSX)
            </h2>
            <p className="text-sm text-[var(--text)] mb-4">
              Selecione um arquivo Excel no padrão: coluna B = número do pedido, C = nome da tarefa,
              D = status, E = atribuído a, F = data início, G = data término, H = duração (dias RDO),
              I = observações (opcional). Cada linha com valor em B é um pedido.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={showLoading}
              className="px-4 py-2.5 rounded-xl font-medium bg-[#2F523E] text-white hover:bg-[#3d6b4f] dark:bg-[#2F523E] dark:hover:bg-[#3dd68c]/90 disabled:opacity-50"
            >
              Selecionar arquivo XLSX
            </button>
            {uploadError && (
              <p className="mt-3 text-sm text-red-500 dark:text-red-400" role="alert">
                {uploadError}
              </p>
            )}
          </section>
        </main>
      </div>

      {selectedFile && (
        <ConfirmUploadModal
          fileName={selectedFile.name}
          onConfirm={handleConfirmAnalysis}
          onCancel={handleCancelAnalysis}
          isLoading={false}
        />
      )}

      {projectToDelete && (
        <ConfirmDeleteModal
          projectName={projectToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setProjectToDelete(null)}
        />
      )}

      {pendingProject && (
        <NameProjectModal
          defaultName={pendingProject.name || 'Novo Projeto'}
          onConfirm={handleConfirmProjectName}
          onCancel={() => setPendingProject(null)}
        />
      )}

      {showLoading && <LoadingOverlay />}
    </div>
  )
}
