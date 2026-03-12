import { useState, useEffect } from 'react'

interface NameProjectModalProps {
  defaultName: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

export default function NameProjectModal({
  defaultName,
  onConfirm,
  onCancel,
}: NameProjectModalProps) {
  const [name, setName] = useState(defaultName)

  useEffect(() => {
    setName(defaultName)
  }, [defaultName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-project-title"
    >
      <div className="bg-[var(--surf)] border border-[var(--bdr)] rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surf2)] hover:text-[var(--text)]"
          aria-label="Fechar"
        >
          <span className="text-xl leading-none">×</span>
        </button>
        <h2 id="name-project-title" className="text-lg font-bold text-[var(--text)] mb-2 pr-8">
          Nome do projeto
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          A análise foi concluída. Defina um nome para este projeto antes de continuar.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Proman Vila Velha"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] placeholder-[var(--muted)] mb-4 focus:outline-none focus:ring-2 focus:ring-[#2F523E] dark:focus:ring-[#3dd68c]"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--surf2)] text-[var(--text)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#2F523E] hover:bg-[#3d6b4f] dark:bg-[#2F523E] dark:hover:bg-[#3dd68c]/90 disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
