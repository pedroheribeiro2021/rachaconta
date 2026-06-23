# RachaConta

App web mobile-first para dividir a conta de bares, restaurantes e mesas compartilhadas. Sem login: quem cria a mesa gera um link/código de convite, cada participante entra com um apelido, marca os itens que consumiu, e o app calcula automaticamente quanto cada um deve pagar (com taxa de serviço opcional).

## Stack

Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS 4 + shadcn/ui, Zustand, Supabase (Postgres + Auth anônima + Realtime) como backend, Vitest + Playwright para testes. Deploy na Vercel. Detalhes em [`docs/architecture.md`](./docs/architecture.md).

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um projeto no [Supabase](https://supabase.com), aplique as migrations em `supabase/migrations/` (e opcionalmente o seed em `supabase/seeds/seed.sql`).
3. Copie `.env.example` para `.env` e preencha com as credenciais do seu projeto Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```
4. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm run start` | build e start de produção |
| `npm run lint` | ESLint |
| `npm run test` / `test:watch` / `test:coverage` | testes unitários/integração (Vitest) |
| `npm run e2e` / `e2e:ui` | testes end-to-end (Playwright) |

## Documentação

- [`docs/architecture.md`](./docs/architecture.md) — stack, estrutura de pastas, fluxos principais, autenticação, realtime
- [`docs/database.md`](./docs/database.md) — schema do Postgres, RLS, índices
- [`docs/domain.md`](./docs/domain.md) — regras de negócio: como a divisão da conta é calculada
- [`docs/testing.md`](./docs/testing.md) — estratégia de testes e cobertura atual
