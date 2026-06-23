# Testes

## Unitários / integração — Vitest

```
npm run test          # roda em watch por padrão (CI usa: npm run test -- --run)
npm run test:watch
npm run test:coverage
```

Config: `vitest.config.ts` — ambiente `jsdom`, inclui `src/**/*.test.ts(x)` (exclui `src/tests/e2e`), setup em `src/tests/setup.ts` (carrega `@testing-library/jest-dom`). Coverage via provider `v8`, reporters `text` + `html`.

Hoje a cobertura real está concentrada inteiramente no motor de divisão, em `src/features/split/tests/`:

- **`rounding.test.ts`** — `splitCentsEvenly`: divisão exata (`6000/3`), distribuição de resto (`5000/3`, `100/3`), e que a soma do array bate com o total original mesmo em casos grandes (`9999/7`, `999999/37`).
- **`calculate-participant-totals.test.ts`** — fluxo completo: item dividido entre participantes + taxa de serviço aplicada sobre o subtotal de cada um.
- **`service-fee.test.ts`** — `applyServiceFee` isolado: percentual aplicado corretamente e taxa zero não altera o subtotal.

As pastas `tests/` dentro de `room`, `items`, `participants`, `item-consumers` e `suggestions` existem mas **estão vazias** — não há testes unitários para criação/entrada de mesa, CRUD de item, toggle de consumidor ou storage de sugestões.

## End-to-end — Playwright

```
npm run e2e          # roda todos os specs em src/tests/e2e
npm run e2e:ui        # modo interativo
```

Config: `playwright.config.ts` — `testDir: ./src/tests/e2e`, `baseURL: http://localhost:3000`, sobe o servidor com `npm run dev` (reaproveita um servidor já rodando quando `CI` não está definido).

Specs existentes:

- **`home.spec.ts`** — cria mesa com apelido "Pedro", adiciona item "Pizza" R$ 100, marca o próprio criador como consumidor, e valida na UI que aparecem Subtotal R$ 100,00, Taxa R$ 10,00 e Total R$ 110,00 (taxa de serviço padrão de 10%).
- **`multi-participant.spec.ts`** — cria mesa, extrai o código da URL, navega para `/join/{code}` e confirma que o botão "Entrar" aparece — cobre só a navegação até a tela de entrada, não a confirmação efetiva de que um segundo participante aparece na sala.

Não há specs e2e cobrindo edição/exclusão de item, múltiplos itens com taxa diferente de 10%, ou o segundo participante de fato concluindo a entrada e vendo o estado compartilhado via realtime.

## CI

`.github/workflows/ci.yml` roda em push para `main`/`develop` e em pull requests: `npm install` → `npm run test -- --run` → `npm run build` → `npx playwright install --with-deps` → `npm run e2e`. As credenciais do Supabase (`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`) vêm de GitHub Secrets — os testes e2e batem em um projeto Supabase real, não em mock.
