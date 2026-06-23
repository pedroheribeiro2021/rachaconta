# Banco de dados

Postgres gerenciado pelo Supabase (projeto `grsqjzrgngpyckcfkxon`).

## ⚠️ Os arquivos em `supabase/migrations/` não refletem o banco real

`supabase/migrations/20260528140320_initial_schema.sql` e `20260528140402_rls_policies.sql` descrevem um schema e um conjunto de policies de RLS que **nunca foram de fato aplicados** ao projeto remoto como estão escritos — o banco real foi montado por fora (provavelmente direto no dashboard) em algum momento, e os arquivos do repo nunca foram sincronizados de volta. Confirmado em 2026-06-23 via introspecção direta (`supabase db query` contra `information_schema` e `pg_policies`) depois que uma tentativa de migration (`items_update`/`items_delete`) falhou duas vezes contra colunas e tipos que não existem em produção.

O conteúdo abaixo descreve **o que está rodando de verdade em produção**, não o que os arquivos de migration dizem. Diferenças relevantes:

- `rooms.host_auth_id` é `text` (não `uuid`); `rooms.service_fee_percent` é `integer` (não `numeric(5,2)`); não existem `rooms.status` nem `rooms.updated_at`.
- `participants.auth_id` é `text` (não `uuid`); a coluna de timestamp é `created_at` (não `joined_at`); **não existe** a constraint `unique(room_id, auth_id)` — nada impede o mesmo `auth_id` de entrar duas vezes na mesma mesa.
- `items` **não tem** `created_by` nem `updated_at` — bate com o código (`create-item.ts` nunca envia `created_by`).
- `item_consumers` **não tem** coluna `id` nem `selected_at` — a chave primária é composta (`item_id`, `participant_id`).
- A tabela `suggestions` **não existe em produção**. O seed (`supabase/seeds/seed.sql`) e a feature de sugestões no app (`src/features/suggestions/`) usam apenas IndexedDB local — ver [`domain.md`](./domain.md) — então essa tabela nunca fez falta na prática.
- Toda policy de RLS em produção é **permissiva (`true`)** — nenhuma delas usa `auth.uid()` de verdade, apesar do arquivo de migration descrever checagens como `auth.uid() = host_auth_id`.

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

RLS está habilitado, mas **toda policy de escrita em produção é totalmente permissiva**:

| Tabela | Operações com policy | Regra real |
|---|---|---|
| `rooms` | select, insert | `true` |
| `participants` | select, insert | `true` |
| `items` | select, insert, update, delete | `true` |
| `item_consumers` | select, insert, delete | `true` |

Não há policy de `update`/`delete` para `rooms` nem `participants` (deny por padrão nessas operações), e não há policy de `update` para `item_consumers`. Fora isso, **qualquer cliente com a anon key pode ler e escrever qualquer linha de qualquer tabela** — não há isolamento por mesa nem por participante hoje. Isso é adequado para um MVP sem contas reais, mas vale ter em mente: não há proteção contra um participante malicioso editar/excluir itens de outra mesa, por exemplo.

Decisão registrada em 2026-06-23: não alterar esse comportamento agora (ver [[project_architecture]] na memória do projeto) — qualquer reforço de RLS deve primeiro corrigir os tipos (`text` vs `uuid` em `auth_id`/`host_auth_id`) e ser testado contra o schema real, não contra os arquivos de migration desatualizados.
