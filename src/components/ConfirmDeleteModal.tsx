interface ConfirmDeleteModalProps {
  projectName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteModal({
  projectName,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        className="bg-[var(--surf)] border border-[var(--bdr)] rounded-2xl shadow-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-delete-title" className="text-lg font-bold text-[var(--text)] mb-2">
          Apagar projeto
        </h2>
        <p className="text-sm text-[var(--text)] mb-4">
          Deseja apagar esse projeto{projectName ? ` "${projectName}"` : ''}?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--surf2)] text-[var(--text)]"
          >
            Não
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
          >
            Sim
          </button>
        </div>
      </div>
    </div>
  )
}
