# Banco de dados

Postgres gerenciado pelo Supabase (projeto `grsqjzrgngpyckcfkxon`).

## Schema verificado contra produção

Confirmado em 2026-06-25 via introspecção direta do projeto Supabase (`grsqjzrgngpyckcfkxon`) contra `information_schema`, `pg_catalog` e `pg_policies`. `supabase/migrations/20260528140320_initial_schema.sql` e `20260528140402_rls_policies.sql` foram reescritos nessa data para servirem de baseline fiel ao que está rodando — antes disso, os arquivos descreviam um schema e policies de RLS que nunca foram de fato aplicados ao projeto remoto (o banco real foi montado por fora, provavelmente direto no dashboard, e os arquivos nunca tinham sido sincronizados de volta).

Pontos que vieram de tentativa e erro no histórico (e por isso vale manter registrados):

- `rooms.host_auth_id` é `text` (não `uuid`); `rooms.service_fee_percent` é `integer` (não `numeric(5,2)`); não existem `rooms.status` nem `rooms.updated_at`.
- `participants.auth_id` é `text` (não `uuid`); a coluna de timestamp é `created_at` (não `joined_at`); **não existe** a constraint `unique(room_id, auth_id)` — nada impede o mesmo `auth_id` de entrar duas vezes na mesma mesa.
- `items` **não tem** `created_by` nem `updated_at` — bate com o código (`create-item.ts` nunca envia `created_by`).
- `item_consumers` **não tem** coluna `id` nem `selected_at` — a chave primária é composta (`item_id`, `participant_id`).
- A tabela `suggestions` **não existe em produção** e foi removida da migration. O seed (`supabase/seeds/seed.sql`) e a feature de sugestões no app (`src/features/suggestions/`) usam apenas IndexedDB local — ver [`domain.md`](./domain.md) — então essa tabela nunca fez falta na prática.
- Toda policy de RLS em produção é **permissiva (`true`)** — nenhuma delas usa `auth.uid()` de verdade.

## Tabelas (schema real)

### `rooms`
| Coluna | Tipo |
|---|---|
| `id` | uuid, PK |
| `code` | text, único (`rooms_code_key`) |
| `host_auth_id` | text |
| `service_fee_percent` | integer |
| `created_at` | timestamptz |

### `participants`
| Coluna | Tipo |
|---|---|
| `id` | uuid, PK |
| `room_id` | uuid, FK → `rooms.id` |
| `auth_id` | text |
| `nickname` | text |
| `created_at` | timestamptz |

### `items`
| Coluna | Tipo |
|---|---|
| `id` | uuid, PK |
| `room_id` | uuid, FK → `rooms.id` |
| `name` | text |
| `price_cents` | integer |
| `created_at` | timestamptz |

### `item_consumers`
Chave primária composta `(item_id, participant_id)` — não tem `id` próprio.

| Coluna | Tipo |
|---|---|
| `item_id` | uuid, FK → `items.id` |
| `participant_id` | uuid, FK → `participants.id` |

## Índices

`idx_items_room` (`items.room_id`), `idx_participants_room` (`participants.room_id`), além dos índices implícitos de PK/UNIQUE. Não há índice dedicado em `item_consumers.participant_id` (só a PK composta, que cobre `item_id` como coluna líder).

## Row-Level Security — estado real

RLS está habilitado com isolamento real por sessão anônima (migration `20260625000000_rls_enforce.sql`, aplicada em 2026-06-25).

`auth.uid()` retorna `uuid`; `host_auth_id` e `auth_id` são `text` — todas as policies usam `auth.uid()::text` para comparação.

Duas funções `security definer` evitam recursão RLS em `participants`:
- `public.is_room_participant(room_id uuid)` — retorna true se o chamador é participante da mesa
- `public.is_own_participant(participant_id uuid)` — retorna true se o `participant_id` pertence ao chamador

| Tabela | Op | Regra |
|---|---|---|
| `rooms` | SELECT | `true` (open read — necessário para `joinRoom` antes de ser participante) |
| `rooms` | INSERT | `host_auth_id = auth.uid()::text` |
| `participants` | SELECT | `is_room_participant(room_id)` |
| `participants` | INSERT | `auth_id = auth.uid()::text` |
| `items` | SELECT | `is_room_participant(room_id)` |
| `items` | INSERT | `is_room_participant(room_id)` |
| `items` | UPDATE | `is_room_participant(room_id)` (using + with check) |
| `items` | DELETE | `is_room_participant(room_id)` |
| `item_consumers` | SELECT | item → `is_room_participant(item.room_id)` |
| `item_consumers` | INSERT | `is_own_participant(participant_id)` + item na sua mesa |
| `item_consumers` | DELETE | `is_own_participant(participant_id)` |

Não há policy de `update`/`delete` para `rooms` nem `participants` (deny por padrão).

**Limitação conhecida**: `items` não tem `created_by`, então qualquer participante da mesa pode editar/excluir itens de outros participantes. Para restringir ao criador seria necessário adicionar `created_by text` ao schema.
