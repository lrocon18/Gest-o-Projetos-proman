# Gestão de Projetos — Grupo Proman Engenharia

Sistema web para acompanhamento de projetos de engenharia: controle de status, dias trabalhados (RDO), datas de início e término, com dashboard visual e edição integrada. O upload de planilhas XLSX é analisado pelo **backend Node.js**, que usa a **API Anthropic (Claude)** para mapear os dados ao dashboard. Paleta de cores da marca Proman e modo claro/escuro.

---

## Funcionalidades

- **Login** — Autenticação simples; rotas protegidas (sem login não acessa o sistema).
- **Seleção de projetos** — Listar projetos existentes ou criar novo via upload de planilha XLSX.
- **Análise com Claude (Anthropic)** — Ao selecionar um XLSX, um modal pergunta se deseja prosseguir; ao confirmar, o arquivo é enviado ao **backend Node.js**, que usa a API Anthropic para análise e mapeamento dos dados ao dashboard.
- **Campos obrigatórios** — O modal informa quais informações são necessárias para o dashboard. Se houver subdivisões (ex.: Civil, Elétrica), o backend cria um dashboard por categoria.
- **Dashboard** — KPIs, gráfico de status (donut), gráfico de dias trabalhados (barras), timeline Gantt e cards por projeto.
- **Filtro por status** — Todos, Em andamento, Em espera, Não iniciado, Concluído.
- **Edição por tópicos** — Editar cada projeto em modal; alterações refletem em todo o dashboard.
- **Tema** — Modo escuro.

---

## GitHub Actions e deploy

O repositório inclui dois workflows em `.github/workflows/`:

### CI (`.github/workflows/ci.yml`)

- Dispara em **push** e **pull_request** nas branches `main` e `master`.
- **Frontend:** `npm ci` e `npm run build`.
- **Backend:** `npm ci` na pasta `backend` e verificação de sintaxe do `server.js`.

### Deploy para GitHub Pages (`.github/workflows/deploy.yml`)

- Dispara em **push** na branch `main` (e manualmente via *Run workflow*).
- Faz o build do frontend com `base` configurado para o nome do repositório (para funcionar em `https://<user>.github.io/<repo>/`).
- Publica a pasta `dist` no GitHub Pages.

**Para ativar o deploy:**

1. No repositório no GitHub: **Settings → Pages**.
2. Em **Build and deployment**, em **Source** escolha **GitHub Actions**.
3. Após o primeiro push na `main`, o workflow será executado e o site ficará em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

**Backend em produção:** O frontend no GitHub Pages é estático. Para a análise de XLSX (API Anthropic) funcionar, é preciso hospedar o backend em um serviço (ex.: Railway, Render, Fly.io) e configurar a URL da API no frontend (variável de ambiente `VITE_API_URL` no build, ou no código do serviço de análise).

---

## Como rodar

### Pré-requisitos

- Node.js 18+ e npm (ou yarn/pnpm).
- **Chave da API Anthropic** (Claude): [Console Anthropic](https://console.anthropic.com/).

### 1. Backend (Node.js)

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env` (copie de `backend/.env.example`) e defina a chave:

```bash
ANTHROPIC_API_KEY=sua_chave_aqui
PORT=3001
```

Inicie o servidor:

```bash
npm run dev
```

O backend ficará em **http://localhost:3001**. As rotas disponíveis: `GET /api/health` (confere se o servidor está no ar) e `POST /api/analyze-xlsx` (recebe o arquivo e devolve os projetos mapeados).

**Importante:** Para o botão **"Prosseguir com a análise"** funcionar ao anexar um XLSX, o backend precisa estar rodando. Se o backend não estiver em execução, você verá erro 404 ou mensagem orientando a iniciar o backend.

### 2. Frontend (React + Vite)

Em outro terminal, na raiz do projeto:

```bash
npm install
npm run dev
```

O frontend ficará em **http://localhost:5173**. Em desenvolvimento, as requisições para `/api/*` são repassadas ao backend na porta 3001 (proxy no Vite). Se o backend não estiver rodando nessa porta, a análise do XLSX falhará.

### Produção

- **Backend:** `cd backend && npm start` (use `PORT` no .env ou variável de ambiente).
- **Frontend:** `npm run build` e sirva a pasta `dist/`. Se o backend estiver em outra origem, defina `VITE_API_URL=http://sua-api` antes do build.

---

## Login (demonstração)

- **Usuário:** qualquer texto.
- **Senha:** `proman` ou qualquer senha com 4+ caracteres.

---

## Fluxo de uso

1. **Login** — Tela inicial com usuário e senha.
2. **Escolher projeto** — Lista de projetos ou “Adicionar projeto (XLSX)”.
3. **Adicionar projeto** — Selecionar arquivo XLSX → **modal** com lista de campos obrigatórios e aviso de que o arquivo será analisado pelo servidor (Claude). **Prosseguir** envia ao backend; **Cancelar** remove o arquivo.
4. **Campos obrigatórios:** Responsável pelo projeto, Data de início/término (projeto), Título, Dias de projetos, Número do pedido, Nome da tarefa, Status da tarefa, Atribuído a, Data de início/término do pedido, Duração do pedido, Status do pedido. Subdivisões (ex.: Civil, Elétrica) geram um dashboard por categoria.
5. **Dashboard** — KPIs, gráficos, Gantt e cards; filtro por status; botão “Editar” para alterar dados.

---

## Stack

| Camada     | Tecnologias |
|-----------|-------------|
| Front-end | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, date-fns |
| Backend   | Node.js, Express, multer, xlsx, @anthropic-ai/sdk (Claude) |
| Persistência | localStorage (login, tema, projetos); análise de XLSX no backend |

---

## Estrutura

```
backend/           # Servidor Node.js
├── server.js      # Express, POST /api/analyze-xlsx, integração Anthropic
├── .env           # ANTHROPIC_API_KEY, PORT (não commitar)
└── .env.example

src/
├── components/    # Logo, ConfirmUploadModal, componentes do dashboard
├── constants/     # requiredFields
├── contexts/      # Auth, Theme, Projects
├── lib/           # chartColors
├── pages/         # Login, ProjectList, Dashboard
├── services/      # analyzeXlsx (chama o backend)
└── types/         # ProjectRow, ProjectFile, ProjectMeta
```

---

## Licença

Uso interno — Grupo Proman Engenharia.
