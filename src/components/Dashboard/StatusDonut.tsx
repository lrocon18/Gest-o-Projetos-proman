import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ProjectRow } from '@/types/project'
import { STATUS_COLORS } from '@/lib/chartColors'

const STATUS_ORDER = ['Em andamento', 'Em espera', 'Não iniciado', 'Concluído'] as const

interface StatusDonutProps {
  rows: ProjectRow[]
}

export default function StatusDonut({ rows }: StatusDonutProps) {
  const data = STATUS_ORDER.map((status) => ({
    name: status,
    value: rows.filter((r) => r.status === status).length,
    color: STATUS_COLORS[status] ?? '#6b7280',
  })).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-[var(--muted)] text-sm">
        Sem dados
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value, '']}
          contentStyle={{
            background: 'var(--surf)',
            border: '1px solid var(--bdr)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'var(--text)' }}
        />
        <Legend
          formatter={(value, entry) => (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>
              {value} ({entry.payload?.value})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
