import { XLSX_COLUMN_LAYOUT } from '@/constants/requiredFields'

interface ConfirmUploadModalProps {
  fileName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmUploadModal({
  fileName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmUploadModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-upload-title"
    >
      <div
        className="bg-[var(--surf)] border border-[var(--bdr)] rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="confirm-upload-title" className="text-lg font-bold text-[var(--text)] mb-2">
            Analisar arquivo?
          </h2>
          <p className="text-sm text-[var(--text)] mb-3">
            O arquivo <strong className="font-medium">{fileName}</strong> será enviado ao servidor
            para análise com Claude (Anthropic) e mapeamento dos dados. Deseja prosseguir?
          </p>
          <div className="rounded-lg bg-[var(--surf2)] border border-[var(--bdr)] p-4 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              Padrão esperado das colunas (B a I)
            </p>
            <p className="text-xs text-[var(--text)] mb-2">
              A planilha deve seguir este layout. Quando houver valor na coluna B (número do pedido),
              as demais informações desse pedido estão na mesma linha.
            </p>
            <ul className="text-xs text-[var(--text)] space-y-1">
              {XLSX_COLUMN_LAYOUT.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-xs text-[var(--muted)] mt-2">
              Subdivisões (ex.: Civil, Elétrica) geram um dashboard por categoria.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--surf2)] text-[var(--text)] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#2F523E] hover:bg-[#3d6b4f] dark:bg-[#2F523E] dark:hover:bg-[#3dd68c]/90 disabled:opacity-50"
            >
              {isLoading ? 'Analisando…' : 'Prosseguir com a análise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
