# Arquitetura

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (style `radix-nova`), Lucide, Sonner (toasts) |
| Estado | Zustand |
| Formulários/validação | React Hook Form + Zod |
| Backend | Supabase (Postgres + Auth + Realtime) — sem API própria |
| Persistência local | localStorage (apelido), IndexedDB via `idb` (sugestões) |
| Testes | Vitest + Testing Library (unit/integração), Playwright (E2E) |
| Deploy | Vercel |
| CI | GitHub Actions |

Não há backend dedicado (NestJS, Express, etc.). O Next.js fala diretamente com o Supabase a partir do client (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`). RLS está habilitado no Postgres, mas **hoje não restringe nada de fato** — toda policy de escrita em produção é permissiva. Ver o alerta no topo de [`database.md`](./database.md) antes de assumir qualquer isolamento entre mesas/participantes.

## Autenticação

Não existe login tradicional. Ao acessar `/` ou `/join/[code]`, o app chama `ensureAnonymousAuth()` (`src/lib/supabase/auth.ts`), que usa `supabase.auth.signInAnonymously()` caso não haja sessão ativa. O `auth.uid()` resultante é gravado como `host_auth_id` (em `rooms`) ou `auth_id` (em `participants`), mas hoje isso é só rastreabilidade — nenhuma policy de RLS realmente compara esses valores com `auth.uid()` em produção (ver [`database.md`](./database.md)).

## Organização de pastas

```
src/
  app/                     # rotas (App Router)
    page.tsx               # criar mesa
    join/[code]/page.tsx   # entrar em mesa existente
    room/[code]/page.tsx   # sala principal (itens, atribuição, totais)
    room/[code]/summary/   # resumo final somente leitura
  features/                # um diretório por domínio de negócio
    room/                  # mesa: schema, api, store, realtime
    participants/
    items/
    item-consumers/        # atribuição item <-> participante
    split/                 # motor de cálculo da divisão (domain puro, sem I/O)
    suggestions/           # autocomplete de nomes de item (IndexedDB)
  lib/
    supabase/              # client.ts (browser client), auth.ts (auth anônimo)
    realtime/              # ver nota abaixo
    storage/                # localStorage (apelido)
    analytics/, logger/
  types/                   # tipos compartilhados
  tests/e2e/               # specs Playwright
```

Cada feature segue o mesmo padrão interno quando aplicável: `api/` (chamadas Supabase), `components/`, `hooks/`, `services/`, `store/` (Zustand), `schema/` (Zod), `types/`, `tests/`.

## Realtime

`subscribeRoom(roomId, onChange)` (`src/features/room/realtime/subscribe-room.ts`) abre um channel Supabase Realtime (`room-{roomId}`) escutando `postgres_changes` em `participants`, `items` e `item_consumers`. A página da sala reage recarregando o snapshot (`fetchRoomSnapshot`) sempre que algo muda — não há merge incremental de eventos, é sempre um refetch completo.

## Fluxos principais

**Criar mesa** — `/` → `ensureAnonymousAuth()` → `createRoom(nickname, authId)` (insere `rooms` + `participants` do host) → redireciona para `/room/{code}`.

**Entrar em mesa** — `/join/[code]` → `ensureAnonymousAuth()` → `joinRoom(code, nickname, authId)` (busca a `room` pelo código, insere novo `participants`) → redireciona para `/room/{code}`.

**Adicionar item** — formulário converte reais para centavos (`Math.round(valor * 100)`) → `createItem({ roomId, name, priceCents })` → realtime propaga para os demais participantes.

**Atribuir item a participante** — checkbox por participante/item chama `toggleItemConsumer({ itemId, participantId, selected })`. O parâmetro `selected` representa o estado **atual** (antes do clique): se `true`, a função faz `DELETE` (desmarca); se `false`, faz `INSERT` (marca). Isso é counter-intuitivo lendo o nome do parâmetro — vale atenção ao tocar nesse código.

**Cálculo de totais** — ver [`domain.md`](./domain.md).

## Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Ambas são públicas (prefixo `NEXT_PUBLIC_`) porque o client Supabase roda no browser. O modelo de segurança pretendido delega isso ao RLS, mas hoje o RLS em produção não impõe restrição alguma — ver [`database.md`](./database.md).