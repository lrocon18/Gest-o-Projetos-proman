import { useState } from 'react'
import { format, differenceInCalendarDays, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ProjectRow, ProjectStatus } from '@/types/project'
import { STATUS_COLORS, STATUS_CLASSES } from '@/lib/chartColors'

const STATUS_OPTIONS: ProjectStatus[] = ['Não iniciado', 'Em espera', 'Em andamento', 'Concluído']

const TIPO_PROJETO_OPTIONS = [
  { label: 'Projeto de Civil', value: 'Civil' },
  { label: 'Projeto de Elétrica', value: 'Elétrica' },
] as const

function progressPct(row: ProjectRow): number {
  if (row.status === 'Concluído') return 100
  if (row.status === 'Não iniciado') return 0
  if (!row.iniD || !row.fimD) return row.status === 'Em andamento' ? 30 : 10
  const now = Date.now()
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((now - row.iniD.getTime()) / (row.fimD.getTime() - row.iniD.getTime())) * 100
      )
    )
  )
}

function progressColor(pct: number): string {
  if (pct >= 80) return 'var(--green)'
  if (pct >= 40) return 'var(--orange)'
  return 'var(--purple)'
}

function toDateInput(d: string | null | undefined): string {
  if (!d) return ''
  const parsed = new Date(d)
  return isValid(parsed) ? parsed.toISOString().slice(0, 10) : ''
}

function computedDias(ini: string | null, fim: string | null): number | null {
  if (!ini || !fim) return null
  const dIni = parseISO(ini)
  const dFim = parseISO(fim)
  if (!isValid(dIni) || !isValid(dFim)) return null
  const days = differenceInCalendarDays(dFim, dIni)
  return days >= 0 ? days : null
}

interface EditProjectDrawerProps {
  open: boolean
  onClose: () => void
  projectId: string
  projectName: string
  rows: ProjectRow[]
  onUpdateRow: (projectId: string, rowId: string, patch: Partial<ProjectRow>) => void
  onAddRow?: (projectId: string) => void
  onRemoveRow?: (projectId: string, rowId: string) => void
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

export default function EditProjectDrawer({
  open,
  onClose,
  projectId,
  projectName,
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
}: EditProjectDrawerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ProjectRow>>({})

  const handleRemoveRow = (rowId: string) => {
    onRemoveRow?.(projectId, rowId)
    if (expandedId === rowId) setExpandedId(null)
    if (editingId === rowId) {
      setEditingId(null)
      setForm({})
    }
  }

  const handleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
    if (editingId === id) {
      setEditingId(null)
      setForm({})
    }
  }

  const handleStartEdit = (row: ProjectRow) => {
    setEditingId(row.id)
    setForm({
      nomeFull: row.nomeFull,
      nome: row.nome,
      cat: row.cat,
      pc: row.pc,
      resp: row.resp,
      ini: row.ini,
      fim: row.fim,
      obs: row.obs,
      status: row.status,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({})
  }

  const handleChange = (field: keyof ProjectRow, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveEdit = () => {
    const row = rows.find((r) => r.id === editingId)
    if (!row || !editingId) return
    const ini = (form.ini as string | null) ?? row.ini
    const fim = (form.fim as string | null) ?? row.fim
    const dias = computedDias(ini, fim)
    const nomeFull = (form.nomeFull as string) ?? row.nomeFull
    onUpdateRow(projectId, editingId, {
      nomeFull: nomeFull || row.nomeFull,
      nome: nomeFull || row.nome,
      cat: (form.cat as string) ?? row.cat,
      pc: (form.pc as string) ?? row.pc,
      resp: (form.resp as string) ?? row.resp,
      ini: ini || null,
      fim: fim || null,
      obs: (form.obs as string) ?? row.obs,
      status: (form.status as ProjectStatus) ?? row.status,
      dias,
    })
    setEditingId(null)
    setForm({})
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-[var(--surf)] border-l border-[var(--bdr)] shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Editar projeto"
      >
        <div className="flex items-center justify-between border-b border-[var(--bdr)] px-4 py-3">
          <h2 className="text-lg font-bold text-[var(--text)]">Editar projeto — {projectName}</h2>
          <div className="flex items-center gap-2">
            {onAddRow && (
              <button
                type="button"
                onClick={() => onAddRow(projectId)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#2F523E] text-white hover:bg-[#3d6b4f]"
              >
                Adicionar item
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surf2)] hover:text-[var(--text)]"
              aria-label="Fechar"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {rows.length === 0 && (
            <p className="text-sm text-[var(--muted)] py-4 text-center">
              Nenhum item ainda. Clique em &quot;Adicionar item&quot; para criar o primeiro.
            </p>
          )}
          {rows.map((row) => {
            const isExpanded = expandedId === row.id
            const isEditing = editingId === row.id
            const displayRow: ProjectRow = isEditing
              ? {
                  ...row,
                  nomeFull: (form.nomeFull as string) ?? row.nomeFull,
                  nome: (form.nome as string) ?? row.nome,
                  cat: (form.cat as string) ?? row.cat,
                  status: (form.status as ProjectStatus) ?? row.status,
                }
              : row
            const pct = progressPct(displayRow)
            const pcolor = progressColor(pct)
            const fmtDate = (d: Date | null | undefined) =>
              d ? format(d, 'dd/MM/yy', { locale: ptBR }) : '—'
            const editDias = isEditing
              ? computedDias(form.ini ?? null, form.fim ?? null)
              : row.dias

            return (
              <div
                key={row.id}
                className="rounded-xl border border-[var(--bdr)] bg-[var(--surf2)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleExpand(row.id)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[var(--bdr)]/30 transition-colors"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[displayRow.status] }}
                  />
                  <span className="flex-1 truncate text-sm font-medium text-[var(--text)]">
                    {row.nomeFull || row.nome || '—'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_CLASSES[displayRow.status] ?? ''}`}
                  >
                    {displayRow.status}
                  </span>
                  <span className="text-[var(--muted)] text-xs">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--bdr)] p-4 bg-[var(--surf)]">
                    <div className="flex items-start gap-2 mb-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: STATUS_COLORS[displayRow.status] }}
                      />
                      <p className="text-sm font-medium text-[var(--text)] leading-snug flex-1">
                        {row.nomeFull || row.nome || '—'}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_CLASSES[displayRow.status] ?? ''}`}
                      >
                        {displayRow.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="col-span-2">
                        <div className="text-[10px] uppercase text-[var(--muted)] mb-1">Nome do item</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={form.nomeFull ?? row.nomeFull}
                            onChange={(e) => {
                              handleChange('nomeFull', e.target.value)
                              handleChange('nome', e.target.value)
                            }}
                            placeholder="Ex: Proteção tancagem..."
                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          />
                        ) : (
                          <span className="text-[var(--text)]">{displayRow.nomeFull || displayRow.nome || '—'}</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="text-[10px] uppercase text-[var(--muted)] mb-1">Tipo de projeto</div>
                        {isEditing ? (
                          <select
                            value={form.cat ?? row.cat}
                            onChange={(e) => handleChange('cat', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          >
                            {TIPO_PROJETO_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[var(--text)]">
                            {TIPO_PROJETO_OPTIONS.find((o) => o.value === displayRow.cat)?.label ?? displayRow.cat ?? '—'}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="text-[10px] uppercase text-[var(--muted)] mb-1">Status</div>
                        {isEditing ? (
                          <select
                            value={form.status ?? row.status}
                            onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLASSES[displayRow.status] ?? ''}`}
                          >
                            {displayRow.status}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--muted)]">Nº PC</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={form.pc ?? ''}
                            onChange={(e) => handleChange('pc', e.target.value)}
                            className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          />
                        ) : (
                          <span className="font-mono text-xs text-[var(--text)]">{row.pc || '—'}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--muted)]">Responsável</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={form.resp ?? ''}
                            onChange={(e) => handleChange('resp', e.target.value)}
                            className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          />
                        ) : (
                          <span className="text-[var(--text)]">{row.resp || '—'}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--muted)]">Início</div>
                        {isEditing ? (
                          <input
                            type="date"
                            value={toDateInput(form.ini ?? null)}
                            onChange={(e) =>
                              handleChange('ini', e.target.value ? e.target.value : null)
                            }
                            className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          />
                        ) : (
                          <span className="text-[var(--text)]">{fmtDate(row.iniD)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--muted)]">Término</div>
                        {isEditing ? (
                          <input
                            type="date"
                            value={toDateInput(form.fim ?? null)}
                            onChange={(e) =>
                              handleChange('fim', e.target.value ? e.target.value : null)
                            }
                            className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-[var(--bdr)] bg-[var(--bg)] text-[var(--text)] text-xs"
                          />
                        ) : (
                          <span className="text-[var(--text)]">{fmtDate(row.fimD)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--muted)]">Dias Trab. (RDO)</div>
                        <span className="font-bold" style={{ color: 'var(--red)' }}>
                          {editDias != null ? `${editDias} dias` : '—'}
                        </span>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">
                          Calculado com base nas datas (somente leitura)
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-[var(--muted)]">Progresso est.</div>
                        <span className="font-bold" style={{ color: pcolor }}>
                          {pct}%
                        </span>
                        <p className="text-[10px] text-[var(--muted)] mt-0.5">Somente leitura</p>
                      </div>
                    </div>

                    <div className="mt-2 h-1 rounded bg-[var(--bdr)] overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: pcolor }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--muted)] mt-1">
                      Progresso estimado com base nas datas
                    </p>

                    <div className="mt-3 pl-3 border-l-2 border-[var(--orange)] rounded-r bg-[var(--surf2)] py-2 px-3">
                      {isEditing ? (
                        <textarea
                          value={form.obs ?? ''}
                          onChange={(e) => handleChange('obs', e.target.value)}
                          rows={3}
                          placeholder="Observações"
                          className="w-full text-xs bg-transparent text-[var(--text)] placeholder-[var(--muted)] resize-y border-0 focus:outline-none focus:ring-0"
                        />
                      ) : (
                        <p className="text-xs text-[var(--muted)] italic">
                          {row.obs ? `📝 ${row.obs}` : '—'}
                        </p>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 rounded-lg border border-[var(--bdr)] bg-[var(--surf2)] text-[var(--text)] text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="flex-1 py-2 rounded-lg font-semibold text-white bg-[#2F523E] hover:bg-[#3d6b4f] text-sm"
                        >
                          Salvar
                        </button>
                        {onRemoveRow && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 flex-shrink-0"
                            aria-label="Excluir item"
                            title="Excluir item"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(row)}
                          className="text-xs text-[var(--orange)] hover:underline"
                        >
                          Editar
                        </button>
                        {onRemoveRow && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="flex items-center gap-1.5 text-xs text-red-500 hover:underline"
                            aria-label="Excluir item"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
