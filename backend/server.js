import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import XLSX from 'xlsx'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const ANTHROPIC_PROMPT = `A planilha segue o PADRÃO DE COLUNAS abaixo. Cada linha com valor na coluna B (número do pedido) é um pedido; todas as informações desse pedido estão na MESMA LINHA.

PADRÃO ESPERADO DAS COLUNAS:
- Coluna B: Número do pedido (quando existe valor em B, ex.: B8, as demais informações do pedido estão na linha 8).
- Coluna C: Nome da tarefa (ex.: "Proteção tancagem externa para melhoria segurança alimentar").
- Coluna D: Status. Use EXATAMENTE um dos valores: "Em espera", "Concluído", "Não iniciado", "Em andamento".
- Coluna E: Atribuído a (nome do responsável, opcionalmente a empresa).
- Coluna F: Data de início (YYYY-MM-DD).
- Coluna G: Data de término (YYYY-MM-DD).
- Coluna H: Duração em dias trabalhados (RDOs), número.
- Coluna I: Status/informativo ou observações (opcional; se não houver, deixe vazio).

Regras:
1. Mapeie o JSON da planilha respeitando esse layout (colunas B, C, D...).
2. Status deve ser exatamente: "Em andamento", "Em espera", "Não iniciado" ou "Concluído".
3. Datas em YYYY-MM-DD.
4. IMPORTANTE: Retorne UM ÚNICO projeto contendo TODOS os pedidos da planilha no array "rows". Não divida em vários projetos. Inclua TODAS as linhas com valor na coluna B.
5. Para cada row, preencha "cat" com "Civil" ou "Elétrica" conforme a natureza do pedido (ex.: obras civis, construção, estruturas = Civil; instalações elétricas, elétrica = Elétrica). Se não for óbvio, use "Civil". O dashboard usará "cat" para agrupar e exibir as seções "Projetos de Civil" e "Projetos de Elétrica" dentro do mesmo projeto.

Saída: JSON válido com UM projeto e TODOS os rows. Sem texto antes ou depois.
{"projects":[{"name":"Projeto","responsavelProjeto":"string ou null","dataInicioProjeto":"YYYY-MM-DD ou null","dataTerminoProjeto":"YYYY-MM-DD ou null","titulo":"string ou null","diasProjetos":number ou null,"rows":[{"pc","nome","nomeFull","cat","status","resp","ini","fim","dias","obs"}]}]}
Para cada row: pc = col B, nome e nomeFull = col C, cat = "Civil" ou "Elétrica", status = col D, resp = col E, ini = col F, fim = col G, dias = col H (número), obs = col I.`

const STATUS_VALUES = ['Em andamento', 'Em espera', 'Não iniciado', 'Concluído']

function normalizeStatus(s) {
  if (s == null) return 'Não iniciado'
  const str = String(s).trim()
  if (STATUS_VALUES.includes(str)) return str
  const lower = str.toLowerCase()
  if (lower.includes('andamento')) return 'Em andamento'
  if (lower.includes('espera') || lower.includes('aguard')) return 'Em espera'
  if (lower.includes('concluíd') || lower.includes('concluido') || lower.includes('finaliz')) return 'Concluído'
  return 'Não iniciado'
}

function normalizeDate(s) {
  if (s == null || s === '') return null
  const d = new Date(String(s))
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function normalizeNumber(s) {
  if (s == null || s === '') return null
  const n = Number(s)
  return isNaN(n) ? null : Math.round(n)
}

function normalizeString(s) {
  return s == null ? '' : String(s).trim()
}

function mapRowToProjectRow(row, index) {
  const pc = normalizeString(row.pc ?? row.B ?? row.numeroPedido ?? row.numero_pedido ?? row['Número do pedido'])
  const nome = normalizeString(row.nome ?? row.C ?? row.nomeTarefa ?? row.nome_tarefa ?? row['Nome da tarefa'])
  const nomeFull = normalizeString(row.nomeFull ?? row.nomeCompleto ?? row.nome_full ?? nome)
  let cat = normalizeString(row.cat ?? row.categoria ?? row.category ?? 'Civil')
  if (cat && !/^(Civil|Elétrica|Eletrica)$/i.test(cat)) {
    cat = /elét|eletr/i.test(cat) ? 'Elétrica' : 'Civil'
  }
  if (!cat) cat = 'Civil'
  const status = normalizeStatus(row.status ?? row.D ?? row.statusPedido ?? row.status_pedido ?? row['Status do pedido'])
  const resp = normalizeString(row.resp ?? row.E ?? row.responsavel ?? row.atribuidoA ?? row.atribuido_a ?? row['Atribuído a'])
  const ini = normalizeDate(row.ini ?? row.F ?? row.dataInicio ?? row.data_inicio ?? row.dataInicioPedido ?? row['Data de início do pedido'])
  const fim = normalizeDate(row.fim ?? row.G ?? row.dataTermino ?? row.data_termino ?? row.dataTerminoPedido ?? row['Data de término do pedido'])
  const dias = normalizeNumber(row.dias ?? row.H ?? row.duracao ?? row.duracaoPedido ?? row.duracao_pedido ?? row['Duração do pedido'])
  const obs = normalizeString(row.obs ?? row.I ?? row.observacoes ?? row.observações ?? '')
  return {
    id: `row_${index}_${Date.now()}`,
    pc,
    nome: nome || nomeFull,
    nomeFull: nomeFull || nome,
    cat: cat || 'Civil',
    status,
    resp,
    ini,
    fim,
    dias,
    obs,
    iniD: ini ? new Date(ini) : null,
    fimD: fim ? new Date(fim) : null,
  }
}

function parseClaudeResponse(text) {
  let jsonStr = text.trim()
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) jsonStr = match[1].trim()
  const parsed = JSON.parse(jsonStr)
  return Array.isArray(parsed.projects) ? parsed.projects : []
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.post('/api/analyze-xlsx', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'Nenhum arquivo enviado.' })
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey?.trim()) {
    return res.status(500).json({
      ok: false,
      message: 'ANTHROPIC_API_KEY não configurada no servidor.',
    })
  }
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' })
    const firstSheet = wb.Sheets[wb.SheetNames[0]]
    if (!firstSheet) {
      return res.status(400).json({ ok: false, message: 'Planilha vazia ou inválida.' })
    }
    const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '', raw: false })
    if (rawRows.length === 0) {
      return res.status(400).json({ ok: false, message: 'Nenhuma linha na planilha.' })
    }
    const col = (row, i) => (row && row[i] !== undefined && row[i] !== null ? String(row[i]).trim() : '')
    const firstRow = rawRows[0] || []
    const looksLikeHeader =
      /número|pedido|nome|tarefa|status|atribuído|data|início|término|duração|obs/i.test(
        col(firstRow, 1) + col(firstRow, 2) + col(firstRow, 3)
      )
    const dataRows = looksLikeHeader ? rawRows.slice(1) : rawRows
    const rowsByColumn = dataRows
      .map((row) => ({
        B: col(row, 1),
        C: col(row, 2),
        D: col(row, 3),
        E: col(row, 4),
        F: col(row, 5),
        G: col(row, 6),
        H: col(row, 7),
        I: col(row, 8),
      }))
      .filter((r) => r.B !== '')
    if (rowsByColumn.length === 0) {
      return res.status(400).json({ ok: false, message: 'Nenhuma linha com número de pedido (coluna B) encontrada.' })
    }
    const sheetText = JSON.stringify(rowsByColumn, null, 0).slice(0, 200000)
    const userContent = `Dados da planilha (cada objeto = uma linha; B=coluna B, C=coluna C, etc.):\n\n${sheetText}\n\n${ANTHROPIC_PROMPT}`

    const anthropic = new Anthropic({ apiKey })
    const maxRetries = 3
    const retryDelayMs = 3000
    let message
    let lastErr
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8192,
          messages: [{ role: 'user', content: userContent }],
        })
        break
      } catch (err) {
        lastErr = err
        const status = err?.status ?? err?.error?.error?.type
        const isOverloaded = err?.status === 529 || err?.status === 429 || err?.error?.error?.type === 'overloaded_error'
        if (isOverloaded && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * attempt))
          continue
        }
        throw err
      }
    }
    if (!message) throw lastErr

    const textBlock = message.content?.find((b) => b.type === 'text')
    const text = textBlock?.text ?? ''
    if (!text) {
      return res.status(502).json({ ok: false, message: 'Resposta da API sem conteúdo.' })
    }

    const geminiProjects = parseClaudeResponse(text)
    if (geminiProjects.length === 0) {
      return res.status(400).json({ ok: false, message: 'Nenhum projeto identificado na planilha.' })
    }

    const allRows = []
    let meta = {}
    let rowIndex = 0
    for (const gp of geminiProjects) {
      const rows = (gp.rows ?? []).map((r) => mapRowToProjectRow(r, rowIndex++))
      allRows.push(...rows)
      if (!meta.responsavelProjeto && gp.responsavelProjeto) meta.responsavelProjeto = String(gp.responsavelProjeto).trim()
      if (!meta.dataInicioProjeto && gp.dataInicioProjeto) meta.dataInicioProjeto = normalizeDate(gp.dataInicioProjeto)
      if (!meta.dataTerminoProjeto && gp.dataTerminoProjeto) meta.dataTerminoProjeto = normalizeDate(gp.dataTerminoProjeto)
      if (!meta.titulo && gp.titulo) meta.titulo = String(gp.titulo).trim()
      if (meta.diasProjetos == null && gp.diasProjetos != null) meta.diasProjetos = normalizeNumber(gp.diasProjetos)
    }

    const singleProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: 'Projeto',
      createdAt: new Date().toISOString(),
      rows: allRows,
      meta: {
        responsavelProjeto: meta.responsavelProjeto,
        dataInicioProjeto: meta.dataInicioProjeto,
        dataTerminoProjeto: meta.dataTerminoProjeto,
        titulo: meta.titulo,
        diasProjetos: meta.diasProjetos,
      },
    }

    res.json({ ok: true, projects: [ singleProject ] })
  } catch (err) {
    console.error(err)
    const status = err?.status
    const isOverloaded = status === 529 || status === 429 || err?.error?.error?.type === 'overloaded_error'
    const message = isOverloaded
      ? 'Serviço de análise temporariamente sobrecarregado. Aguarde alguns instantes e tente novamente.'
      : err?.message ?? 'Erro ao analisar o arquivo.'
    res.status(isOverloaded ? 503 : 500).json({ ok: false, message })
  }
})

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`)
})
