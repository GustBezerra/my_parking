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
│   ├── services/                 # Regras negocio (entrada, saida, QR, auth, vaga)
│   └── auth/                     # protectRoute() p/ API routes admin
└── components/                   # Componentes UI (QR display, entrada screen, etc.)

## Repository pattern
Interfaces definem contratos p/ operacoes DB. Services dependem das interfaces, nunca da implementacao. Troca SQLite ↔ Supabase muda so injecao; services intactos.

## Fluxo entrada
1. Tela inicial carrega → service busca vaga disponivel de menor code → gera novo token UUID → gera QR com esse token → exibe QR
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

## Dados seed
Vagas fixas com codes numericos (1, 2, 3... N). N definido em config. Todas iguais (sem tipo).

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
