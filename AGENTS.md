# my_parking — Guia para Agentes de IA

## Stack
- NextJS 16 (App Router, TypeScript strict)
- Drizzle ORM + SQLite (dev) → Supabase/PostgreSQL (producao)
- qrcode (npm) — geracao QR como data URI
- use-next-sse (npm) — SSE tempo real
- jose + bcryptjs — auth JWT em cookie httpOnly
- CSS puro (modules ou global)

## Schema conceitual (DB)
3 tabelas:
- parking_spots: code (numero unico da vaga, ex: 1, 2, 3...), status (disponivel/ocupada)
- entries: spot_id, token (UUID unico do QR), entry_time, exit_time (NULL ate saida)
- admin_users: username, password_hash

### Diferenca entre code e token
- code: identificador fixo da vaga, puramente numerico (1, 2, 3...). Usado p/ ordenar e selecionar vaga de menor numero.
- token: UUID gerado sob demanda a cada entrada. Unico por sessao. Codificado no QR. Vincula entrada com saida. Expirado apos uso.
- Nao confundir: code é permanente da vaga, token é temporario da sessao.

## Estrutura de pastas
src/
├── app/                          # App Router (paginas)
│   ├── api/                      # API routes
│   ├── entrada/                  # Tela inicial com QR code via SSE
│   ├── saida/                    # Pagina saida (input token)
│   └── admin/                    # Painel admin (login, dashboard, CRUD vagas, historico)
├── lib/
│   ├── db/                       # Drizzle client setup + schema
│   ├── repositories/             # Interfaces + sqlite/ impl
│   │   └── supabase/             # (futuro) mesma interface, novo cliente
│   ├── use-cases/                # Regras negocio + testes
│   │   ├── prepare-entry.ts
│   │   ├── prepare-entry.spec.ts # ← teste (mesmo nivel, mesmo nome)
│   │   ├── confirm-entry.ts
│   │   ├── confirm-entry.spec.ts
│   │   ├── process-exit.ts
│   │   ├── process-exit.spec.ts
│   │   ├── admin-login.ts
│   │   ├── admin-login.spec.ts
│   │   └── test-helper.ts        # Factory p/ DB :memory: + repos
│   └── auth/                     # protectRoute() p/ API routes admin
└── components/                   # Componentes UI (QR display, entrada screen, etc.)

## Repository pattern
Interfaces definem contratos p/ operacoes DB. Use cases dependem das interfaces, nunca da implementacao. Troca SQLite ↔ Supabase muda so injecao; use cases intactos.

## Fluxo entrada
1. Tela inicial carrega → use case busca vaga disponivel de menor code → gera novo token UUID → gera QR com esse token → exibe QR
2. Visitante escaneia QR com celular → abre URL /entrada/confirmar?token=<uuid>
3. API route: busca entry pelo token (nao existe ainda, é o primeiro uso) → cria entry com spot_id + token + entry_time=now → marca spot ocupada → retorna pagina com QR (mesmo token) p/ visitante salvar
4. API route emite SSE vaga_ocupada contendo dados da proxima vaga disponivel + seu QR ja gerado
5. Tela inicial recebe SSE → exibe novo QR → ciclo

## Fluxo saida
1. Visitante chega saida, acessa /saida com token (do QR salvo no celular)
2. Endpoint saida: busca entry pelo token (exit_time IS NULL) → marca exit_time=now → spot volta disponivel
3. SSE nao necessario — tela entrada descobre vaga livre quando proximo visitante escanear

## Server-Sent Events (SSE)
- use-next-sse p/ SSE unidirecional servidor → tela entrada
- Unico evento: vaga_ocupada — payload contem dados da vaga que ocupou + QR ja gerado p/ proxima vaga
- useSSE hook no client: ao receber vaga_ocupada, renderiza novo QR
- Reconexao automatica configurada

## Auth
- Admin login via JWT em cookie httpOnly
- protectRoute() chamada em cada API route admin
- Retorna 401 se token invalido/ausente
- Pagina admin redireciona p/ /admin/login se 401

## Migrations
- Geradas via `drizzle-kit generate` — nunca escrever SQL manual p/ schema
- Aplicadas com `drizzle-orm/better-sqlite3/migrator` (inclusive em testes)
- Proibido: ler arquivos `.sql` com `fs`/`path`, fazer parse manual de SQL, ou executar statements raw
- `test-helper.ts` usa `migrate(db, { migrationsFolder: './drizzle' })` p/ manter `:memory:` sincronizado

## Dados seed
Vagas fixas com codes numericos (1, 2, 3... N). N definido em config. Todas iguais (sem tipo).

## Testes
- Vitest p/ testes unitarios (focus use-cases, por enquanto)
- Cada use case tem arquivo `.spec.ts` no mesmo nivel, mesmo nome
  - Ex: `prepare-entry.ts` ⇄ `prepare-entry.spec.ts`
- Testes usam `createTestRepos()` do `test-helper.ts` p/ isolar cenario
- Cada suite de testes cria **todas** as entidades que precisa (arrange completo)
  - Nada compartilhado entre suites — cada uma roda com DB `:memory:` proprio
- `test-helper.ts`: `createTestRepos()` abre `:memory:`, aplica migrations com `migrate()` do drizzle, retorna repos prontos
- Toda nova feature exige teste(s)
- Todo bug fix exige teste de regressao
- `npm test` executa todos; `npm run test:watch` p/ TDD

## Clean Code practices
- Single Responsibility: cada funcao/arquivo tem 1 proposito claro
- Funcoes curtas (~20 linhas maximo ideal)
- Sem numeros magicos — constantes nomeadas
- Nomes significativos p/ variaveis, funcoes, arquivos, tabelas, colunas
- DRY: extrair logicas repetidas p/ funcoes reutilizaveis
- Arquivos pequenos (~80-100 linhas maximo ideal)
- Tratamento de erros explicito (try/catch, nunca ignorar)
- TypeScript strict (evitar any, tipos bem definidos)
- Composicao sobre heranca
- Imports organizados: externos → internos, absolutos sobre relativos
- Pure functions onde possivel
- Early return p/ reduzir aninhamento
- Sem side effects escondidos
- Commits atomicos (Conventional Commits)
