import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ProjectRow } from '@/types/project'
import { STATUS_COLORS } from '@/lib/chartColors'

interface DiasBarChartProps {
  rows: ProjectRow[]
}

export default function DiasBarChart({ rows }: DiasBarChartProps) {
  const withDias = rows
    .filter((r) => r.dias != null && r.dias > 0)
    .sort((a, b) => (b.dias ?? 0) - (a.dias ?? 0))
    .slice(0, 8)
    .map((r) => ({
      name: r.nome.length > 20 ? r.nome.slice(0, 20) + '…' : r.nome,
      dias: r.dias ?? 0,
      status: r.status,
      color: STATUS_COLORS[r.status] ?? '#6b7280',
    }))

  if (withDias.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-[var(--muted)] text-sm">
        Sem dias trabalhados
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={withDias} layout="vertical" margin={{ left: 8, right: 8 }}>
        <XAxis type="number" stroke="var(--muted)" fontSize={10} />
        <YAxis type="category" dataKey="name" width={100} stroke="var(--muted)" fontSize={10} tick={{ fill: 'var(--muted)' }} />
        <Tooltip
          contentStyle={{
            background: 'var(--surf)',
            border: '1px solid var(--bdr)',
            borderRadius: '8px',
            color: 'var(--text)',
          }}
          formatter={(value: number) => [`${value} dias`, 'RDO']}
          labelStyle={{ color: 'var(--text)' }}
          itemStyle={{ color: 'var(--text)' }}
          cursor={{ fill: 'var(--surf2)' }}
        />
        <Bar dataKey="dias" radius={4} minPointSize={4}>
          {withDias.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
