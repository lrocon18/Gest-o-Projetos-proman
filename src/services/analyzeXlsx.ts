import type { ProjectFile } from '@/types/project'

export interface AnalyzeResult {
  ok: true
  projects: ProjectFile[]
}

export interface AnalyzeError {
  ok: false
  message: string
}

export type AnalyzeOutput = AnalyzeResult | AnalyzeError

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/**
 * Envia o arquivo XLSX para o backend Node.js, que usa a API Anthropic para análise.
 */
export async function analyzeXlsx(file: File): Promise<AnalyzeOutput> {
  const formData = new FormData()
  formData.append('file', file)
  const url = API_BASE ? `${API_BASE}/api/analyze-xlsx` : '/api/analyze-xlsx'

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message =
        res.status === 404
          ? 'Serviço de análise não encontrado (404). Confira se o backend está rodando: no terminal, em backend/, execute npm run dev.'
          : res.status === 503
            ? (data?.message ?? 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.')
            : data?.message ?? `Erro do servidor (${res.status}).`
      return { ok: false, message }
    }
    if (!data.ok || !Array.isArray(data.projects)) {
      return {
        ok: false,
        message: data?.message ?? 'Resposta inválida do servidor.',
      }
    }
    return { ok: true, projects: data.projects }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Erro ao enviar o arquivo. Verifique se o backend está rodando.',
    }
  }
}
