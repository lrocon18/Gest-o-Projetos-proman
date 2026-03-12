/**
 * Padrão de colunas esperado no XLSX (coluna B = número do pedido; demais dados na mesma linha).
 */
export const XLSX_COLUMN_LAYOUT = [
  'B: Número do pedido (cada linha com valor em B = um pedido; demais dados na mesma linha)',
  'C: Nome da tarefa',
  'D: Status (Em espera, Concluído, Não iniciado, Em andamento)',
  'E: Atribuído a (responsável, opcionalmente empresa)',
  'F: Data de início',
  'G: Data de término',
  'H: Duração em dias trabalhados (RDOs)',
  'I: Observações / status informativo (opcional)',
] as const

export const REQUIRED_FIELDS_FOR_DASHBOARD = [
  'Número do pedido (col. B)',
  'Nome da tarefa (col. C)',
  'Status (col. D)',
  'Atribuído a (col. E)',
  'Data de início (col. F)',
  'Data de término (col. G)',
  'Duração em dias RDO (col. H)',
  'Col. I opcional (observações)',
] as const
