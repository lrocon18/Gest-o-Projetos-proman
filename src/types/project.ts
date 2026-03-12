/**
 * Modelo de um projeto de engenharia (linha do XLSX / card do dashboard).
 * Campos devem bater com as colunas do template "Acompanhamento de Projetos Proman".
 */
export type ProjectStatus = 'Em andamento' | 'Em espera' | 'Não iniciado' | 'Concluído'

export interface ProjectRow {
  id: string
  pc: string
  nome: string
  nomeFull: string
  cat: string
  status: ProjectStatus
  resp: string
  ini: string | null
  fim: string | null
  dias: number | null
  obs: string
  /** Datas parseadas (preenchidas após leitura do XLSX) */
  iniD?: Date | null
  fimD?: Date | null
}

/**
 * Metadados do projeto (nível dashboard), preenchidos pela análise Gemini quando disponíveis.
 */
export interface ProjectMeta {
  responsavelProjeto?: string
  dataInicioProjeto?: string | null
  dataTerminoProjeto?: string | null
  titulo?: string
  diasProjetos?: number | null
}

/**
 * Projeto "container" (um arquivo XLSX pode gerar um ou mais projetos, ex.: por categoria Civil/Elétrica).
 */
export interface ProjectFile {
  id: string
  name: string
  createdAt: string
  rows: ProjectRow[]
  /** Preenchido pela análise Gemini */
  meta?: ProjectMeta
}
