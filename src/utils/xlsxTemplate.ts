import * as XLSX from 'xlsx'
import { XLSX_HEADERS } from './xlsxSchema'

/**
 * Gera um XLSX em branco com apenas a primeira linha de cabeçalhos
 * no padrão "Acompanhamento de Projetos Proman", para o usuário baixar como modelo.
 */
export function downloadTemplateXlsx(): void {
  const ws = XLSX.utils.aoa_to_sheet([XLSX_HEADERS as unknown as string[]])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Projetos')
  XLSX.writeFile(wb, 'Acompanhamento de Projetos Proman - modelo.xlsx')
}
