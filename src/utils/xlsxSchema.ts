/**
 * Esquema do arquivo XLSX "Acompanhamento de Projetos Proman".
 * O arquivo anexado deve ter exatamente estas colunas (na primeira linha).
 */
export const XLSX_HEADERS = [
  'Nº PC',
  'Nome',
  'Nome Completo',
  'Categoria',
  'Status',
  'Responsável',
  'Data Início',
  'Data Término',
  'Dias Trabalhados (RDO)',
  'Observações',
] as const

export type XlsxHeader = (typeof XLSX_HEADERS)[number]

/** Mapeamento: nome da coluna no XLSX -> campo no ProjectRow */
export const HEADER_TO_FIELD: Record<string, keyof import('@/types/project').ProjectRow> = {
  'Nº PC': 'pc',
  Nome: 'nome',
  'Nome Completo': 'nomeFull',
  Categoria: 'cat',
  Status: 'status',
  Responsável: 'resp',
  'Data Início': 'ini',
  'Data Término': 'fim',
  'Dias Trabalhados (RDO)': 'dias',
  Observações: 'obs',
}

export const STATUS_VALUES = ['Em andamento', 'Em espera', 'Não iniciado', 'Concluído'] as const
