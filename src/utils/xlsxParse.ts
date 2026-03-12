import * as XLSX from 'xlsx'
import type { ProjectRow } from '@/types/project'
import { XLSX_HEADERS, STATUS_VALUES } from './xlsxSchema'

export interface ParseResult {
  ok: true
  rows: ProjectRow[]
}

export interface ParseError {
  ok: false
  message: string
}

export type ParseOutput = ParseResult | ParseError

/**
 * Valida se a primeira linha da planilha contém exatamente os cabeçalhos esperados.
 * Ordem pode variar; o que importa é o conjunto de nomes.
 */
function validateHeaders(firstRow: Record<string, unknown>): boolean {
  const keys = Object.keys(firstRow).filter((k) => String(k).trim() !== '')
  const expected = new Set(XLSX_HEADERS)
  if (keys.length !== expected.size) return false
  for (const k of keys) {
    const normalized = String(k).trim()
    if (!expected.has(normalized as (typeof XLSX_HEADERS)[number])) return false
  }
  return true
}

function toStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

function toDateStr(v: unknown): string | null {
  const s = toStr(v)
  if (!s) return null
  const d = XLSX.SSF.parse_date(s)
  if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  const parsed = new Date(s)
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return s
}

function toNumber(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : Math.round(n)
}

function toStatus(v: unknown): ProjectRow['status'] {
  const s = toStr(v)
  if (STATUS_VALUES.includes(s as ProjectRow['status'])) return s as ProjectRow['status']
  return 'Não iniciado'
}

/**
 * Lê um arquivo XLSX e retorna as linhas no formato ProjectRow.
 * Rejeita se os cabeçalhos não forem iguais ao padrão Proman.
 */
export function parseXlsxFile(file: File): Promise<ParseOutput> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          resolve({ ok: false, message: 'Arquivo vazio ou inválido.' })
          return
        }
        const wb = XLSX.read(data, { type: 'array' })
        const firstSheet = wb.Sheets[wb.SheetNames[0]]
        if (!firstSheet) {
          resolve({ ok: false, message: 'Nenhuma planilha encontrada.' })
          return
        }
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
          raw: false,
          defval: '',
        })
        if (json.length === 0) {
          resolve({ ok: false, message: 'A planilha está vazia.' })
          return
        }
        const firstRow = json[0]
        if (!validateHeaders(firstRow)) {
          resolve({
            ok: false,
            message:
              'O arquivo não segue o padrão esperado. Use o template "Acompanhamento de Projetos Proman" e baixe o modelo de exemplo.',
          })
          return
        }
        const rows: ProjectRow[] = json.map((row, index) => {
          const get = (header: string) => row[header] ?? row[header.trim()]
          const pc = toStr(get('Nº PC'))
          const nome = toStr(get('Nome'))
          const nomeFull = toStr(get('Nome Completo')) || nome
          const cat = toStr(get('Categoria')) || 'Civil'
          const status = toStatus(get('Status'))
          const resp = toStr(get('Responsável'))
          const ini = toDateStr(get('Data Início'))
          const fim = toDateStr(get('Data Término'))
          const dias = toNumber(get('Dias Trabalhados (RDO)'))
          const obs = toStr(get('Observações'))
          return {
            id: `row_${index}_${Date.now()}`,
            pc,
            nome,
            nomeFull,
            cat,
            status,
            resp,
            ini,
            fim,
            dias,
            obs,
          }
        })
        resolve({ ok: true, rows })
      } catch (err) {
        resolve({
          ok: false,
          message: err instanceof Error ? err.message : 'Erro ao ler o arquivo.',
        })
      }
    }
    reader.onerror = () => resolve({ ok: false, message: 'Falha ao ler o arquivo.' })
    reader.readAsArrayBuffer(file)
  })
}
