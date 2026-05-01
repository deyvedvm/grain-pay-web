# Decisões arquiteturais — grain-pay-web

## 2026-05-01 — Stack inicial

### Vite + React + TypeScript (em vez de Next.js)
A API já é um backend Spring Boot separado. Não há necessidade de SSR, rotas server-side ou edge functions. Vite entrega DX superior para SPA pura, build mais rápido e configuração mínima.

### Tailwind CSS v4 + shadcn/ui (em vez de MUI)
- Tailwind v4: novo motor com `@tailwindcss/vite`, sem `tailwind.config.js`, tokens via CSS vars.
- shadcn/ui (estilo *new-york*): componentes copiados pro projeto (não é uma dependência), totalmente customizáveis. Padrão de fato em apps modernos React/Next desde 2024. Casa bem com Tailwind e oferece visual sóbrio adequado a dashboards financeiros.

### Paleta — inspiração Stripe Dashboard
Neutros (cinza/branco) com primário índigo (`oklch(0.55 0.18 265)`). Sem cores berrantes; foco em legibilidade de dados. Suporte a dark mode via classe `.dark` no `<html>`.

### Zustand (em vez de Redux Toolkit)
O único client state global é auth (token + user). Redux seria over-engineering. Zustand resolve em ~10 linhas com persistência em localStorage via middleware `persist`. Server state fica no TanStack Query — separação clara de responsabilidades.

### TanStack Query como camada de dados
Cache, refetch, loading/error states sem boilerplate. Defaults conservadores: `staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: false`.

### Axios com interceptor JWT
Token lido do store Zustand a cada request. 401 → logout automático + redirect para `/login`.

### React Router v6
Padrão para SPA. Routes aninhadas: `ProtectedRoute > AppShell > <Outlet />`.

### React Hook Form + Zod
Formulários performáticos (uncontrolled) com validação tipada. Integra com shadcn `Form`.

### Recharts (em vez de Chart.js / Victory)
Componentes React-first, integra naturalmente com a paleta via CSS vars (`--chart-1`...`--chart-5`).

### Estrutura por feature
`src/features/<dominio>/` agrupa páginas + componentes específicos. Componentes verdadeiramente compartilhados ficam em `components/`. Evita "pasta gigante de pages".
