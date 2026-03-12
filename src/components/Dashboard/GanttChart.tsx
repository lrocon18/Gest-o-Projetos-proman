import { useMemo } from 'react'
import type { ProjectRow } from '@/types/project'
import { STATUS_COLORS } from '@/lib/chartColors'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MAX_TIMELINE_MS = 3 * 365.25 * 24 * 60 * 60 * 1000 // 3 anos

interface GanttChartProps {
  rows: ProjectRow[]
}

export default function GanttChart({ rows }: GanttChartProps) {
  const { min, max, months, todayPct } = useMemo(() => {
    const withDates = rows.filter((r) => r.iniD)
    if (withDates.length === 0) {
      return { min: new Date(), max: new Date(), months: [] as string[], todayPct: 0 }
    }
    const dates = withDates.flatMap((r) => [r.iniD!, r.fimD!].filter(Boolean))
    const min = new Date(Math.min(...dates.map((d) => d.getTime())))
    let max = new Date(Math.max(...dates.map((d) => d.getTime())))
    min.setMonth(min.getMonth() - 1)
    min.setDate(1)
    max.setMonth(max.getMonth() + 2)
    const spanMs = max.getTime() - min.getTime()
    if (spanMs > MAX_TIMELINE_MS) {
      max = new Date(min.getTime() + MAX_TIMELINE_MS)
    }
    const months: string[] = []
    const d = new Date(min)
    while (d <= max) {
      months.push(format(d, 'MMM', { locale: ptBR }))
      d.setMonth(d.getMonth() + 1)
    }
    const span = max.getTime() - min.getTime()
    const today = new Date()
    const todayPct = span > 0 ? Math.min(100, Math.max(0, ((today.getTime() - min.getTime()) / span) * 100)) : 0
    return { min, max, months, todayPct }
  }, [rows])

  const span = max.getTime() - min.getTime()

  const bars = useMemo(() => {
    return rows
      .filter((r) => r.iniD)
      .map((p) => {
        const s = ((p.iniD!.getTime() - min.getTime()) / span) * 100
        const end = p.fimD || new Date(p.iniD!.getTime() + 30 * 24 * 60 * 60 * 1000)
        const e = ((end.getTime() - min.getTime()) / span) * 100
        const left = Math.max(0, Math.min(100, s))
        const endClamped = Math.min(100, Math.max(0, e))
        const w = Math.max(2, endClamped - left)
        return {
          ...p,
          left,
          width: w,
          color: STATUS_COLORS[p.status] ?? '#6b7280',
        }
      })
  }, [rows, min, span])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        <div className="flex ml-[110px] border-b border-[var(--bdr)] pb-2 mb-2">
          {months.map((m) => (
            <div key={m} className="flex-1 text-center text-[10px] text-[var(--muted)]">
              {m}
            </div>
          ))}
        </div>
        {bars.map((p) => (
          <div key={p.id} className="flex items-center gap-2 mb-1.5">
            <div
              className="w-[110px] flex-shrink-0 text-right text-[10px] text-[var(--muted)] truncate pr-1"
              title={p.nomeFull}
            >
              {p.nome.length > 16 ? p.nome.slice(0, 16) + '…' : p.nome}
            </div>
            <div className="flex-1 h-6 rounded bg-[var(--surf2)] border border-[var(--bdr)] relative">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-90 rounded z-10"
                style={{ left: `${todayPct}%` }}
                title="Hoje"
              />
              <div
                className="absolute top-0 bottom-0 rounded flex items-center px-1 text-[9px] font-bold text-black overflow-hidden"
                style={{
                  left: `${p.left}%`,
                  width: `${p.width}%`,
                  backgroundColor: p.color,
                }}
              >
                {p.width > 10 && p.dias ? `${p.dias}d` : ''}
              </div>
            </div>
          </div>
        ))}
        {bars.length === 0 && (
          <div className="text-center py-6 text-[var(--muted)] text-sm">Nenhum projeto com datas</div>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[var(--muted)]">
          {(['Em andamento', 'Em espera', 'Não iniciado', 'Concluído'] as const).map((st) => (
            <span key={st} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[st] }}
              />
              {st}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3 bg-red-500 rounded flex-shrink-0" />
            hoje
          </span>
        </div>
      </div>
    </div>
  )
}
