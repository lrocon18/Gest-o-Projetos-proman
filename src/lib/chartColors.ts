/** Cores por status (alinhadas ao dashboard original e paleta Proman) */
export const STATUS_COLORS: Record<string, string> = {
  'Em andamento': '#3dd68c',
  'Em espera': '#f5a623',
  'Não iniciado': '#9b6dff',
  Concluído: '#4a90e2',
}

export const STATUS_CLASSES: Record<string, string> = {
  'Em andamento': 'bg-emerald-500/20 text-emerald-400',
  'Em espera': 'bg-amber-500/20 text-amber-400',
  'Não iniciado': 'bg-purple-500/20 text-purple-400',
  Concluído: 'bg-blue-500/20 text-blue-400',
}
