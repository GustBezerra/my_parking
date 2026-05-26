# Sistema de Gerenciamento de Estacionamento

## 📌 Sobre o Projeto

Este projeto tem como objetivo desenvolver um sistema inteligente para controle de entrada e saída de veículos no estacionamento da faculdade utilizando QR Codes dinâmicos.

A proposta do sistema é tornar o gerenciamento das vagas mais rápido, organizado e automatizado, reduzindo filas e facilitando o controle das vagas disponíveis em tempo real.

Todo o funcionamento será integrado a um banco de dados responsável por armazenar e gerenciar as informações do estacionamento.

---

## ⚙️ Como o Sistema Funcionará

### 🚗 Entrada de Veículos

Ao chegar no estacionamento, o visitante encontrará uma tela exibindo um QR Code disponível referente a uma vaga livre.

O processo acontecerá da seguinte forma:

1. O visitante escaneia o QR Code utilizando o celular;
2. Após o escaneamento:
   - O sistema identificará qual vaga foi atribuída.
   - Um link será exibido para que o visitante possa baixar/salvar o QR Code em seu aparelho.
3. Assim que o QR Code for utilizado:
   - A vaga será marcada como **ocupada** no sistema.
   - Um novo QR Code será gerado automaticamente para o próximo visitante.

---

### 🚪 Saída de Veículos

Na saída do estacionamento, o visitante deverá apresentar o mesmo QR Code salvo anteriormente.

Após a leitura do código:

- o sistema registrará a saída do veículo;
- a vaga utilizada será marcada novamente como **disponível**;
- o histórico da utilização será armazenado no banco de dados.

---

## 🗄️ Gerenciamento de Dados

O sistema utilizará um banco de dados para armazenar todas as informações necessárias para o funcionamento da aplicação.

### 📋 Informações que serão armazenadas

- Identificação dos veículos;
- Código individual de cada vaga;
- QR Code correspondente a cada vaga;
- Status da vaga:
  - Disponível;
  - Ocupada;
- Tipos de vagas:
  - Visitante;
  - Funcionário;
  - Deficiente;
  - Idoso;
  - Entre outras;
- Quantidade total de vagas;
- Registro de entradas e saídas;
- Histórico de utilização do estacionamento;
- Horários de entrada e saída dos veículos.

---

## 🧩 Funcionalidades Principais

✔️ Controle automático das vagas
✔️ Geração dinâmica de QR Codes  
✔️ Registro de entrada e saída de veículos  
✔️ Atualização em tempo real das vagas disponíveis  
✔️ Gerenciamento de diferentes categorias de vagas  
✔️ Armazenamento de dados em banco de dados  
✔️ Histórico completo de utilização do estacionamento

---

## 🛠️ Tecnologias Previstas

### Front-end

- HTML
- CSS
- JavaScript + React/Next.js

### Back-end

- Next.js

### Banco de Dados

- Supabase

### Recursos adicionais

- API para geração e leitura de QR Codes

---

## 📂 Estrutura Inicial do Projeto

```bash
/estacionamento
│
├── /frontend
├── /backend
├── /database
├── /qrcodes
├── README.md
```

---

## 🌐 API Routes

### `GET /api/sse/entrada`
SSE endpoint que envia QR codes em tempo real para a tela de entrada.

Mantém conexão SSE aberta. A cada escaneamento de QR Code, envia a próxima vaga disponível com QR já gerado. O QR code na tela de entrada codifica `/entrada/confirmar?token=<uuid>`.

**Headers:** `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`

**Eventos:**

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `vaga_ocupada` | `{ spot, token, qrDataUrl }` | Vaga disponível com QR code (data URI) |
| `error` | `{ error }` | Nenhuma vaga disponível no momento |

**Resposta 200 (evento `vaga_ocupada`):**
```json
{ "spot": { "id": 1, "code": 1, "status": "disponivel" }, "token": "uuid", "qrDataUrl": "data:image/png;base64,..." }
```

**Resposta 200 (evento `error`):**
```json
{ "error": "Nao ha vagas disponiveis no momento" }
```

---

### `GET /api/confirmar?token=<uuid>`
Confirma a entrada do veículo após escaneamento do QR Code.

Cria o registro de entrada no banco, marca a vaga como ocupada e dispara evento SSE para gerar novo QR.

**Parâmetros query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `token` | string | Sim | Token UUID único da sessão |

**Resposta 200:**
```json
{ "entry": { "id": 1, "spotId": 1, "token": "uuid", "entryTime": "2025-01-01T00:00:00.000Z", "exitTime": null } }
```

**Resposta 400:**
```json
{ "error": "Token é obrigatório" }
```

**Resposta 409:**
```json
{ "error": "Este token ja foi utilizado" }
```

**Resposta 503:**
```json
{ "error": "Nenhuma vaga disponivel no momento" }
```

---

### `GET /api/saida?token=<uuid>`
Registra a saída do veículo. Libera a vaga e marca exit_time na entrada.

**Parâmetros query:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `token` | string | Sim | Token UUID da sessão (mesmo do QR de saída) |

**Resposta 200:**
```json
{ "entry": { "id": 1, "spotId": 1, "token": "uuid", "entryTime": "2025-01-01T00:00:00.000Z", "exitTime": "2025-01-01T12:00:00.000Z" } }
```

**Resposta 400:**
```json
{ "error": "Token é obrigatório" }
```

**Resposta 404:**
```json
{ "error": "Token invalido ou saida ja processada" }
```

---

### `GET /entrada/confirmar?token=<uuid>` (Página)
Página que o visitante acessa ao escanear o QR Code na entrada.

Faz fetch para `/api/confirmar?token=<uuid>` e, em caso de sucesso, exibe um QR Code de saída para o visitante guardar.

---

## 👨‍💻 Equipe de Desenvolvimento

Projeto desenvolvido para fins acadêmicos e práticos por estudantes do curso de Ciência da Computação.

---

<footer align="center">

<h5>“Nosso objetivo é resolver os problemas do estacionamento da faculdade, os do resto do mundo ficam para a próxima versão.” 🌟</h5>

</footer>
