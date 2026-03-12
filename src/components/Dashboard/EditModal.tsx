import { useState, useEffect } from 'react'
import type { ProjectRow, ProjectStatus } from '@/types/project'

const STATUS_OPTIONS: ProjectStatus[] = ['Em andamento', 'Em espera', 'Não iniciado', 'Concluído']

/** Tópicos para agrupar os campos no modal de edição */
const TOPICS = [
  {
    id: 'identificacao',
    title: 'Identificação',
    fields: ['pc', 'nome', 'nomeFull', 'cat'] as const,
  },
  {
    id: 'status',
    title: 'Status do projeto',
    fields: ['status'] as const,
  },
  {
    id: 'responsavel',
    title: 'Responsável',
    fields: ['resp'] as const,
  },
  {
    id: 'datas',
    title: 'Datas e dias trabalhados',
    fields: ['ini', 'fim', 'dias'] as const,
  },
  {
    id: 'obs',
    title: 'Observações',
    fields: ['obs'] as const,
  },
] as const

interface EditModalProps {
  row: ProjectRow
  onClose: () => void
  onSave: (patch: Partial<ProjectRow>) => void
}

export default function EditModal({ row, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState<Partial<ProjectRow>>({ ...row })

  useEffect(() => {
    setForm({ ...row })
  }, [row])

  const handleChange = (field: keyof ProjectRow, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const patch: Partial<ProjectRow> = {
      pc: form.pc ?? '',
      nome: form.nome ?? '',
      nomeFull: form.nomeFull ?? '',
      cat: form.cat ?? 'Civil',
      status: form.status ?? 'Não iniciado',
      resp: form.resp ?? '',
      ini: form.ini ?? null,
      fim: form.fim ?? null,
      dias: form.dias ?? null,
      obs: form.obs ?? '',
    }
    onSave(patch)
    onClose()
  }

  const toDateInput = (d: string | null | undefined) => {
    if (!d) return ''
    const parsed = new Date(d)
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-[var(--surf)] border border-[var(--bdr)] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--surf)] border-b border-[var(--bdr)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)]">Editar projeto</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surf2)] text-[var(--muted)]"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {TOPICS.map((topic) => (
            <div key={topic.id}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                {topic.title}
              </h3>
              <div className="space-y-3">
                {topic.fields.map((field) => {
                  if (field === 'status') {
                    return (
                      <div key={field}>
                        <label className="block text-xs text-[var(--muted)] mb-1">Status</label>
                        <select
                          value={form.status ?? ''}
                          onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)]"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }
                  if (field === 'ini' || field === 'fim') {
                    return (
                      <div key={field}>
                        <label className="block text-xs text-[var(--muted)] mb-1">
                          {field === 'ini' ? 'Data Início' : 'Data Término'}
                        </label>
                        <input
                          type="date"
                          value={toDateInput(form[field] ?? null)}
                          onChange={(e) =>
                            handleChange(field, e.target.value ? e.target.value : null)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)]"
                        />
                      </div>
                    )
                  }
                  if (field === 'dias') {
                    return (
                      <div key={field}>
                        <label className="block text-xs text-[var(--muted)] mb-1">
                          Dias Trabalhados (RDO)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={form.dias ?? ''}
                          onChange={(e) =>
                            handleChange('dias', e.target.value === '' ? null : parseInt(e.target.value, 10))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)]"
                        />
                      </div>
                    )
                  }
                  const label =
                    field === 'pc'
                      ? 'Nº PC'
                      : field === 'nome'
                        ? 'Nome'
                        : field === 'nomeFull'
                          ? 'Nome Completo'
                          : field === 'cat'
                            ? 'Categoria'
                            : field === 'resp'
                              ? 'Responsável'
                              : 'Observações'
                  const isObs = field === 'obs'
                  return (
                    <div key={field}>
                      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
                      {isObs ? (
                        <textarea
                          value={form.obs ?? ''}
                          onChange={(e) => handleChange('obs', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(form[field as keyof ProjectRow] ?? '')}
                          onChange={(e) =>
                            handleChange(field as keyof ProjectRow, e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)]"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--bdr)] bg-[var(--surf2)] text-[var(--text)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#2F523E] hover:bg-[#3d6b4f] dark:bg-[#2F523E] dark:hover:bg-[#3dd68c]/90"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
