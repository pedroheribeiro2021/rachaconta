# Domínio e regras de negócio

## Conceitos

- **Room (mesa)**: sessão temporária identificada por um `code` curto (gerado por `generateRoomCode()`, `src/lib/utils/generate-room-code.ts` — 6 caracteres em base36, maiúsculo). Tem uma `service_fee_percent` (padrão 10%).
- **Participant**: pessoa que entrou na mesa com um apelido. Vinculado a uma sessão anônima do Supabase Auth (`auth_id`). Em produção não há constraint que impeça a mesma sessão de entrar duas vezes na mesma mesa (ver [`database.md`](./database.md)) — na prática isso não costuma acontecer porque o fluxo de UI não reexecuta `joinRoom` para quem já está na sala, mas não é garantido pelo banco.
- **Item**: uma despesa (ex: "Pizza", R$ 100,00), sempre armazenada em `price_cents` (inteiro, nunca float) para evitar erros de arredondamento de ponto flutuante.
- **Item consumer**: associação entre um item e um participante — "quem consumiu o quê". Um item sem nenhum consumidor não entra no cálculo de ninguém.

## Motor de cálculo (`src/features/split/domain/`)

`calculateParticipantTotals` em **`calculate-participant-totals.ts`** é o único motor de cálculo do projeto (importado pelas páginas `/room/[code]` e `/room/[code]/summary`); a taxa de serviço é aplicada via `applyServiceFee` (`service-fee.ts`), reaproveitada por ambos para evitar duas implementações divergentes da mesma fórmula:

```ts
calculateParticipantTotals({
  participants,      // [{ id, nickname }]
  items,              // [{ id, price_cents }]
  itemConsumers,      // [{ item_id, participant_id }]
  serviceFeePercent,  // ex: 10
}) // -> ParticipantTotal[]
```

Para cada participante, retorna `{ participantId, nickname, subtotalCents, serviceFeeCents, totalCents }`.

### Algoritmo

1. Para cada item, filtra os `itemConsumers` daquele item.
2. Itens sem consumidor são ignorados (não geram cobrança a ninguém).
3. O preço do item é dividido entre os consumidores via `splitCentsEvenly` (ver abaixo) e somado ao subtotal de cada um.
4. Sobre o subtotal de cada participante, calcula a taxa de serviço: `Math.round(subtotal * (serviceFeePercent / 100))`.
5. Total do participante = subtotal + taxa.

### Rateio sem perda de centavos (`rounding.ts`)

```ts
splitCentsEvenly(totalCents: number, peopleCount: number): number[]
```

- Base: `Math.floor(totalCents / peopleCount)` para todos.
- Resto: `totalCents % peopleCount` centavos extras, distribuídos **um a um para os primeiros N participantes** da lista (não é aleatório nem proporcional — é posicional, na ordem em que os consumidores aparecem no array).
- Garantia: a soma do array sempre é exatamente igual a `totalCents` (sem sobra nem falta por arredondamento de float).
- Exemplo: `splitCentsEvenly(5000, 3)` → `[1667, 1667, 1666]`.

> A ordem dos consumidores no array determina quem "leva o centavo extra". Como a query não define um `ORDER BY` explícito em `item_consumers`, isso depende da ordem retornada pelo Postgres/Supabase — na prática estável, mas não há garantia formal de que o mesmo participante sempre será o que recebe o centavo extra entre execuções.

## Sugestões (autocomplete de itens)

`suggestions` é uma lista **global** (não por mesa) de nomes de item já usados, pensada para acelerar o cadastro (ex: digitar "Cho" sugere "Chopp"). Hoje a feature `src/features/suggestions/` grava e lê via **IndexedDB local** (`idb`, banco `rachaconta`, store `suggestions`) — é client-side, por dispositivo, e não está sincronizada com a tabela `suggestions` do Supabase nem entre participantes. A tabela do banco é populada apenas pelo seed inicial; não foi encontrado nenhum código de aplicação que leia/grave nela.

## Apelido local

`src/lib/storage/local-user.ts` persiste o último apelido digitado em `localStorage` (`rachaconta-user`) para pré-preencher o formulário em visitas futuras no mesmo navegador.
