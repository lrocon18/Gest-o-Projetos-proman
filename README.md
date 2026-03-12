# Gestão de Projetos — Grupo Proman Engenharia

Sistema web **frontend-only** para acompanhamento de projetos de engenharia: controle de status, dias trabalhados (RDO), datas de início e término, com dashboard visual e customização via drawer. Projetos e itens são criados e editados diretamente na interface. Paleta de cores da marca Proman e modo escuro.

---

## Funcionalidades

- **Login** — Autenticação simples; rotas protegidas (sem login não acessa o sistema).
- **Seleção de projetos** — Listar projetos existentes ou criar novo pelo botão "Adicionar novo projeto" (modal com nome do projeto).
- **Dashboard** — KPIs, gráfico de status (donut), gráfico de dias trabalhados (barras), timeline Gantt e cards por item.
- **Projeto vazio** — Ao abrir um projeto sem itens, é exibido "Vamos iniciar a customização"; ao clicar, abre o drawer para adicionar itens.
- **Drawer de edição/customização** — Lista de itens (colapsável), edição campo a campo (Nº PC, responsável, datas, status, observação). Botão "Adicionar item" para inserir novos itens no projeto.
- **Filtro por status** — Todos, Em andamento, Em espera, Não iniciado, Concluído.
- **Tema** — Modo escuro.

---

## GitHub Actions e deploy

O repositório inclui dois workflows em `.github/workflows/`:

### CI (`.github/workflows/ci.yml`)

- Dispara em **push** e **pull_request** nas branches `main` e `master`.
- **Frontend:** `npm ci` e `npm run build`.

### Deploy para GitHub Pages (`.github/workflows/deploy.yml`)

- Dispara em **push** na branch `main` (e manualmente via *Run workflow*).
- Faz o build do frontend com `base` configurado para o nome do repositório.
- Publica a pasta `dist` no GitHub Pages.

**Para ativar o deploy:**

1. No repositório no GitHub: **Settings → Pages**.
2. Em **Build and deployment**, em **Source** escolha **GitHub Actions**.
3. Após o primeiro push na `main`, o site ficará em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

**Se o site não abrir (404):**

- Confirme que em **Settings → Pages** a fonte está em **GitHub Actions** (não "Deploy from a branch").
- Use a **URL exata** do repositório: `https://<usuario>.github.io/<nome-do-repo>/`. O `<nome-do-repo>` deve ser **exatamente** o nome do repositório no GitHub (com a mesma grafia, incluindo maiúsculas/minúsculas).
- Se o nome tiver acento (ex.: **Gestão**-Projetos-proman), experimente:
  - **Com acento (codificado):** `https://lrocon18.github.io/Gest%C3%A3o-Projetos-proman/`
  - **Sem acento:** `https://lrocon18.github.io/Gestao-Projetos-proman/` — nesse caso, **renomeie o repositório** no GitHub para `Gestao-Projetos-proman` (Settings → General → Repository name) e faça um novo push para o deploy usar esse nome.
- Em **Actions**, confira se o workflow "Deploy to GitHub Pages" terminou em verde nos dois jobs (build e deploy).

---

## Como rodar

### Pré-requisitos

- Node.js 18+ e npm (ou yarn/pnpm).

### Frontend

Na raiz do projeto:

```bash
npm install
npm run dev
```

O frontend ficará em **http://localhost:5173**.

### Produção

- `npm run build` e sirva a pasta `dist/` (ou use o deploy via GitHub Actions no GitHub Pages).

---

## Login

- **Usuário:** `Admin`
- **Senha:** `Admin@10`
- Qualquer outra combinação será barrada.

---

## Fluxo de uso

1. **Login** — Tela inicial com usuário e senha.
2. **Escolher projeto** — Lista de projetos na sidebar ou botão **"Adicionar novo projeto"**.
3. **Novo projeto** — Modal pede o nome do projeto; ao confirmar, o projeto é criado (vazio) e você é levado ao dashboard.
4. **Dashboard vazio** — Mensagem "Vamos iniciar a customização" e botão que abre o drawer.
5. **Drawer** — "Adicionar item" cria um novo item; expandir a linha e clicar em "Editar" para preencher Nº PC, responsável, datas, status, observação. Dias trabalhados e progresso são calculados automaticamente.
6. **Dashboard preenchido** — KPIs, gráficos, Gantt e cards; filtro por status; botão "Editar projeto" para abrir o drawer novamente.

---

## Stack

| Camada   | Tecnologias |
|----------|-------------|
| Front-end | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, date-fns |
| Persistência | localStorage (login, projetos e itens) |

---

## Estrutura

```
src/
├── components/    # Logo, NewProjectModal, ConfirmDeleteModal, ProjectsSidebar, Dashboard/*
├── contexts/      # Auth, Theme, Projects, Toast
├── lib/           # chartColors
├── pages/         # Login, ProjectList, Dashboard
└── types/         # ProjectRow, ProjectFile, ProjectMeta
```

---

## Licença

Uso interno — Grupo Proman Engenharia.
