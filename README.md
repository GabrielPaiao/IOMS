# 🚀 IOMS - Intelligent Outage Management for Software

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue.svg" alt="TypeScript">
</div>

<div align="center">
  <h3>🎯 Sistema inteligente para gerenciamento de outages de software</h3>
  <p>Uma solução completa para coordenar, aprovar e monitorar indisponibilidades planejadas de sistemas</p>
</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Contribuição](#-contribuição)
- [Roadmap](#-roadmap)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🎯 Sobre o Projeto

O **IOMS** (Intelligent Outage Management for Software) é uma plataforma moderna e intuitiva desenvolvida para empresas que precisam gerenciar outages de software de forma eficiente e coordenada. 

### 🔍 **Problema Resolvido**
- **Coordenação caótica** de paradas de sistema
- **Falta de visibilidade** sobre impactos e dependências
- **Processos de aprovação** manuais e desorganizados
- **Comunicação deficiente** entre equipes
- **Conflitos de horários** não detectados

### ✅ **Solução Oferecida**
Uma plataforma unificada que centraliza todo o processo de gestão de outages, desde o planejamento até a execução, com workflows inteligentes, notificações em tempo real e dashboards analíticos.

---

## 🚀 Funcionalidades

### 📅 **Gestão de Outages**
- **Criação e edição** de solicitações de outage
- **Calendário visual** com visão mensal/semanal
- **Detecção automática** de conflitos de horário
- **Templates personalizáveis** para diferentes tipos de outage
- **Histórico completo** de alterações e aprovações

### 👥 **Sistema de Aprovação**
- **Workflows customizáveis** por aplicação
- **Múltiplos níveis** de aprovação
- **Aprovação em lote** para eficiência
- **Delegação** de responsabilidades
- **Notificações automáticas** por email e sistema

### 💬 **Comunicação Integrada**
- **Chat em tempo real** por outage/aplicação
- **Notificações push** instantâneas
- **Comentários** contextuais
- **Mentions** e alertas direcionados
- **Histórico** de conversas

### 📊 **Analytics e Dashboards**
- **Métricas em tempo real** de outages
- **Relatórios de performance** por aplicação
- **Indicadores de SLA** e compliance
- **Análise de tendências** e padrões
- **Exportação** de dados

### 🏢 **Multi-tenant**
- **Isolamento completo** por empresa
- **Gestão de usuários** e permissões
- **Customização** de workflows
- **Configurações** por organização

### 🔐 **Segurança**
- **Autenticação JWT** robusta
- **Autorização baseada** em roles
- **Criptografia** de dados sensíveis
- **Auditoria completa** de ações
- **Rate limiting** e proteções

---

## 🛠 Tecnologias

### **Backend**
<div align="left">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.IO">
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT">
</div>

### **Frontend**
<div align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router">
</div>

### **DevOps & Tools**
<div align="left">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint">
  <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git">
</div>

---

## 🏗 Arquitetura

```mermaid
graph TB
    subgraph "Frontend (React)"
        A[React App] --> B[Context Providers]
        B --> C[Pages & Components]
        C --> D[Services Layer]
        D --> E[WebSocket Client]
    end
    
    subgraph "Backend (NestJS)"
        F[API Gateway] --> G[Auth Module]
        F --> H[Outages Module]
        F --> I[Chat Module]
        F --> J[Notifications Module]
        G --> K[JWT Strategy]
        H --> L[Outages Service]
        I --> M[WebSocket Gateway]
        J --> N[Mail Service]
    end
    
    subgraph "Database"
        O[PostgreSQL] --> P[Prisma ORM]
    end
    
    subgraph "External Services"
        Q[Email Provider]
        R[File Storage]
    end
    
    E --> M
    D --> F
    L --> P
    N --> Q
    
    classDef frontend fill:#61DAFB,stroke:#333,stroke-width:2px,color:white
    classDef backend fill:#E0234E,stroke:#333,stroke-width:2px,color:white
    classDef database fill:#336791,stroke:#333,stroke-width:2px,color:white
    classDef external fill:#FFA500,stroke:#333,stroke-width:2px,color:white
    
    class A,B,C,D,E frontend
    class F,G,H,I,J,K,L,M,N backend
    class O,P database
    class Q,R external
```

---

## 📦 Instalação

### **Pré-requisitos**
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 ou **yarn** >= 1.22.0
- **PostgreSQL** >= 14.0.0
- **Git** para controle de versão

### **Clone do Repositório**
```bash
# Clone o projeto
git clone https://github.com/GabrielPaiao/IOMS.git

# Entre no diretório
cd IOMS
```

### **Configuração do Backend**
```bash
# Entre no diretório do backend
cd ioms-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Configure a conexão com o banco de dados no arquivo .env
# DATABASE_URL="postgresql://username:password@localhost:5432/ioms"

# Execute as migrações do banco
npx prisma migrate dev

# Gere os seeds de dados iniciais
npx prisma db seed
```

### **Configuração do Frontend**
```bash
# Entre no diretório do frontend (em outro terminal)
cd ioms-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Configure a URL da API no arquivo .env
# VITE_API_BASE_URL=http://localhost:3000/api
```

---

## ⚙️ Configuração

### **Variáveis de Ambiente - Backend**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ioms"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"

# Email
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT=3000
```

### **Variáveis de Ambiente - Frontend**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000

# Application
VITE_APP_NAME="IOMS"
VITE_APP_VERSION="1.0.0"
```

---

## 🚀 Uso

### **Desenvolvimento**
```bash
# Terminal 1 - Backend
cd ioms-backend
npm run start:dev

# Terminal 2 - Frontend
cd ioms-frontend
npm run dev
```

### **Acesso à Aplicação**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000/chat

### **Primeira Execução**
1. **Registro de Admin**: Acesse `/register` para criar o primeiro usuário administrador
2. **Configuração Inicial**: Configure sua empresa e aplicações
3. **Convite de Usuários**: Convide membros da equipe através da interface
4. **Primeira Outage**: Crie sua primeira solicitação de outage

### **Fluxo de Trabalho Típico**
1. **Dev/Key User** cria uma solicitação de outage
2. **Sistema** detecta conflitos automaticamente
3. **Aprovadores** recebem notificações
4. **Chat** permite discussão em tempo real
5. **Dashboard** monitora status e métricas

---

## 📚 API Documentation

### **Endpoints Principais**

#### **Autenticação**
```http
POST /api/auth/login
POST /api/auth/register/admin
POST /api/auth/refresh-token
GET  /api/auth/me
```

#### **Outages**
```http
GET    /api/outages              # Listar outages
POST   /api/outages              # Criar outage
GET    /api/outages/:id          # Detalhes da outage
PATCH  /api/outages/:id          # Atualizar outage
DELETE /api/outages/:id          # Deletar outage
PATCH  /api/outages/:id/approve  # Aprovar outage
PATCH  /api/outages/:id/reject   # Rejeitar outage
```

#### **Aplicações**
```http
GET    /api/applications         # Listar aplicações
POST   /api/applications         # Criar aplicação
GET    /api/applications/:id     # Detalhes da aplicação
PATCH  /api/applications/:id     # Atualizar aplicação
```

#### **Chat**
```http
GET    /api/chat/conversations   # Listar conversas
POST   /api/chat/conversations   # Criar conversa
POST   /api/chat/messages        # Enviar mensagem
```

#### **WebSocket Events**
```javascript
// Conectar ao WebSocket
const socket = io('ws://localhost:3000/chat');

// Eventos disponíveis
socket.emit('conversation:join', { conversationId });
socket.emit('message:send', { conversationId, content });
socket.on('message:received', (message) => {});
socket.on('user:typing', (data) => {});
```

### **Autenticação API**
```javascript
// Headers necessários
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

---

## 🤝 Contribuição

### **Como Contribuir**

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/IOMS.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### **Padrões de Commit**
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de build/config
```

### **Estrutura do Projeto**
```
IOMS/
├── ioms-backend/           # API NestJS
│   ├── src/
│   │   ├── auth/          # Autenticação
│   │   ├── outages/       # Gestão de outages
│   │   ├── chat/          # Chat em tempo real
│   │   ├── applications/  # Gestão de aplicações
│   │   └── shared/        # Módulos compartilhados
│   └── prisma/            # Esquema do banco
├── ioms-frontend/         # React App
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços API
│   │   └── context/       # Context Providers
└── docs/                  # Documentação
```

---

## 🗺 Roadmap

### **Versão 1.1** (Q1 2025)
- [ ] **Mobile App** (React Native)
- [ ] **API v2** com GraphQL
- [ ] **Integração Slack/Teams**
- [ ] **Relatórios avançados**

### **Versão 1.2** (Q2 2025)
- [ ] **Multi-idiomas** (i18n)
- [ ] **Temas customizáveis**
- [ ] **Integração LDAP/SSO**
- [ ] **Webhooks** para integrações

### **Versão 2.0** (Q3 2025)
- [ ] **Microserviços** architecture
- [ ] **Kubernetes** deployment
- [ ] **Machine Learning** para predições
- [ ] **API Gateway** avançado

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Contato

<div align="center">

**Gabriel Pereira Paião**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/gabrielpaiao)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GabrielPaiao)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:gabriel.paiao@email.com)

**São Paulo, Brazil • 2025**

</div>

---

<div align="center">
  <p><strong>🚀 Desenvolvido com ❤️ para otimizar a gestão de outages de software</strong></p>
  <p><em>Se este projeto foi útil para você, considere dar uma ⭐!</em></p>
</div>
