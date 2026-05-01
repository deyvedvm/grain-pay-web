# Grain Pay Web

Frontend do [Grain Pay API](https://github.com/deyvedev/grain-pay-api) — controle de finanças pessoais.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (estilo *new-york*, paleta neutra com primário índigo, inspiração Stripe Dashboard)
- **React Router v6** — roteamento
- **TanStack Query** — server state / cache de chamadas REST
- **Zustand** (com persist) — auth/client state
- **Axios** — HTTP client com interceptor JWT
- **React Hook Form** + **Zod** — formulários e validação
- **Recharts** — gráficos
- **date-fns** — datas
- **Lucide React** — ícones
- **Sonner** — toasts

## Pré-requisitos

- Node.js 20+
- npm 10+
- API rodando (`grain-pay-api` em `http://localhost:8080` por padrão)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App disponível em `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (ex: `http://localhost:8080`) |

## Scripts

| Script | Ação |
|---|---|
| `npm run dev` | Vite dev server com HMR |
| `npm run build` | Type-check + build de produção em `dist/` |
| `npm run preview` | Servir o build localmente |
| `npm run lint` | ESLint |

## Estrutura

```
src/
├── api/                 # axios client + funções por recurso
├── components/
│   ├── ui/              # shadcn (Button, Card, Dialog, ...)
│   └── layout/          # AppShell, ProtectedRoute
├── features/            # 1 pasta por domínio (auth, dashboard, ...)
├── hooks/               # wrappers TanStack Query
├── lib/                 # utils, formatters
├── providers/           # AppProviders (QueryClient, Router, Tooltip, Toaster)
├── store/               # zustand stores
├── types/               # tipos compartilhados (DTOs da API)
├── App.tsx
├── routes.tsx
├── main.tsx
└── index.css            # Tailwind v4 + tokens de tema (light/dark)
```

## Roadmap

- [x] **Etapa 0** — Bootstrap (Vite + Tailwind + shadcn + estrutura)
- [ ] **Etapa 1** — Auth (login, cadastro, ProtectedRoute funcionando)
- [ ] **Etapa 2** — Dashboard com dados reais
- [ ] **Etapa 3** — Transações (lista paginada, filtros, criação com parcelas)
- [ ] **Etapa 4** — Categorias + Contas
- [ ] **Etapa 5** — Orçamentos
- [ ] **Etapa 6** — Metas
- [ ] **Etapa 7** — Relatórios
- [ ] **Etapa 8** — Importação / Exportação
- [ ] **Etapa 9** — Transações recorrentes

## CORS na API

Habilitar `http://localhost:5173` no `SecurityConfig` da `grain-pay-api` antes da Etapa 1.
