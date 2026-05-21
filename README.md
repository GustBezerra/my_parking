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
- JavaScript

### Back-end

- PHP

### Banco de Dados

- MySQL

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

## 👨‍💻 Equipe de Desenvolvimento

Projeto desenvolvido para fins acadêmicos e práticos por estudantes do curso de Ciência da Computação.

<br>

<footer align="center", style="background-color: #F2F0EF; padding: 4px;">

<h5>“Nosso objetivo é resolver os problemas do estacionamento da faculdade, os do resto do mundo ficam para a próxima versão.” 🌟</h5>

</footer>
