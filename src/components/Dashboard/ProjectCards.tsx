import type { ProjectRow } from '@/types/project'
import { STATUS_COLORS, STATUS_CLASSES } from '@/lib/chartColors'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProjectCardsProps {
  rows: ProjectRow[]
  onEditRow?: (row: ProjectRow) => void
}

function progressPct(row: ProjectRow): number {
  if (row.status === 'Concluído') return 100
  if (row.status === 'Não iniciado') return 0
  if (!row.iniD || !row.fimD) return row.status === 'Em andamento' ? 30 : 10
  const now = Date.now()
  return Math.min(100, Math.max(0, Math.round(((now - row.iniD.getTime()) / (row.fimD.getTime() - row.iniD.getTime())) * 100)))
}

function progressColor(pct: number): string {
  if (pct >= 80) return 'var(--green)'
  if (pct >= 40) return 'var(--orange)'
  return 'var(--purple)'
}

export default function ProjectCards({ rows, onEditRow }: ProjectCardsProps) {
  let lastCat = ''
  return (
    <div className="space-y-4">
      {rows.map((p) => {
        const showCat = p.cat !== lastCat
        if (showCat) lastCat = p.cat
        const pct = progressPct(p)
        const pcolor = progressColor(pct)
        const fmtDate = (d: Date | null | undefined) =>
          d ? format(d, 'dd/MM/yy', { locale: ptBR }) : '—'
        return (
          <div key={p.id}>
            {showCat && (
              <div className="flex items-center gap-2 my-4 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                <span className="flex-1 h-px bg-[var(--bdr)]" />
                {p.cat === 'Civil' ? '🏗️' : '⚡'} Projetos de {p.cat}
                <span className="flex-1 h-px bg-[var(--bdr)]" />
              </div>
            )}
            <div className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-4">
              <div className="flex items-start gap-2 mb-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: STATUS_COLORS[p.status] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] leading-snug">
                    {p.nomeFull}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_CLASSES[p.status] ?? ''}`}
                >
                  {p.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted)]">Nº PC</div>
                  <span className="font-mono text-xs text-[var(--muted)]">{p.pc || '—'}</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted)]">Responsável</div>
                  <span>{p.resp || '—'}</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted)]">Início</div>
                  <span>{fmtDate(p.iniD)}</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted)]">Término</div>
                  <span>{fmtDate(p.fimD)}</span>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted)]">Dias Trab. (RDO)</div>
                  <span className="font-bold" style={{ color: 'var(--red)' }}>
                    {p.dias != null ? `${p.dias} dias` : '—'}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-[var(--muted)]">Progresso est.</div>
                  <span className="font-bold" style={{ color: pcolor }}>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1 rounded bg-[var(--bdr)] overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: pcolor }}
                />
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-1">Progresso estimado com base nas datas</p>
              {p.obs && (
                <div className="mt-3 pl-3 border-l-2 border-[var(--orange)] rounded-r bg-[var(--surf2)] py-2 px-3 text-xs text-[var(--muted)] italic">
                  📝 {p.obs}
                </div>
              )}
              {onEditRow && (
                <button
                  type="button"
                  onClick={() => onEditRow(p)}
                  className="mt-3 text-xs text-[var(--orange)] hover:underline"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
