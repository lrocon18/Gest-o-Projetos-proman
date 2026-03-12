import type { ProjectRow } from '@/types/project'

interface KpiGridProps {
  rows: ProjectRow[]
}

const KPIS = [
  { key: 'total', label: 'Total', value: (r: ProjectRow[]) => r.length, color: 'blue' },
  {
    key: 'andamento',
    label: 'Andamento',
    value: (r: ProjectRow[]) => r.filter((p) => p.status === 'Em andamento').length,
    color: 'green',
  },
  {
    key: 'espera',
    label: 'Em Espera',
    value: (r: ProjectRow[]) => r.filter((p) => p.status === 'Em espera').length,
    color: 'orange',
  },
  {
    key: 'naoInic',
    label: 'Não Inic.',
    value: (r: ProjectRow[]) => r.filter((p) => p.status === 'Não iniciado').length,
    color: 'purple',
  },
  {
    key: 'concluido',
    label: 'Concluído',
    value: (r: ProjectRow[]) => r.filter((p) => p.status === 'Concluído').length,
    color: 'blue',
  },
  {
    key: 'dias',
    label: 'Dias RDO',
    value: (r: ProjectRow[]) => r.reduce((s, p) => s + (p.dias ?? 0), 0),
    color: 'red',
  },
] as const

const COLOR_MAP: Record<string, string> = {
  blue: 'var(--blue)',
  green: 'var(--green)',
  orange: 'var(--orange)',
  purple: 'var(--purple)',
  red: 'var(--red)',
}

export default function KpiGrid({ rows }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
      {KPIS.map((kpi) => {
        const val = kpi.value(rows)
        return (
          <div
            key={kpi.key}
            className="rounded-xl border border-[var(--bdr)] bg-[var(--surf)] p-3 sm:p-4 relative overflow-hidden"
            style={{ borderTopWidth: '3px', borderTopColor: COLOR_MAP[kpi.color] }}
          >
            <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
              {kpi.label}
            </div>
            <div
              className="font-black text-2xl sm:text-3xl leading-none"
              style={{ color: COLOR_MAP[kpi.color] }}
            >
              {val}
            </div>
          </div>
        )
      })}
    </div>
  )
}
