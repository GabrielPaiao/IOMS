# 🔌 IOMS - Guia de Integração

<div align="center">
  <h3>📘 Guia completo para integração com o IOMS</h3>
  <p>APIs, WebSocket, Webhooks e exemplos de integração</p>
</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [API REST](#-api-rest)
- [WebSocket](#-websocket)
- [Webhooks](#-webhooks)
- [SDKs e Libraries](#-sdks-e-libraries)
- [Exemplos Práticos](#-exemplos-práticos)
- [Rate Limits](#-rate-limits)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O IOMS oferece múltiplas formas de integração:

- **REST API** - Para operações CRUD e consultas
- **WebSocket** - Para comunicação em tempo real
- **Webhooks** - Para notificações automáticas
- **SDKs** - Para linguagens específicas

### **Base URLs**
```
Production:  https://api.ioms.com
Development: http://localhost:3000
WebSocket:   ws://localhost:3001/chat (dev)
```

---

## 🔐 Autenticação

### **JWT Token Authentication**

#### **1. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "DEV_LEAD",
    "companyId": "company_456"
  }
}
```

#### **2. Usando o Token**
```http
GET /api/outages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 🌐 API REST

### **Outages**

#### **Listar Outages**
```http
GET /api/outages?page=1&limit=20&status=PENDING&priority=HIGH
Authorization: Bearer {token}
```

#### **Criar Outage**
```http
POST /api/outages
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Manutenção Emergencial",
  "description": "Correção de vulnerabilidade crítica",
  "startDate": "2024-01-20T02:00:00Z",
  "endDate": "2024-01-20T04:00:00Z",
  "applicationId": "app_123",
  "priority": "HIGH",
  "type": "EMERGENCY"
}
```

#### **Aprovar/Rejeitar Outage**
```http
PATCH /api/outages/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "APPROVE",
  "comment": "Aprovado conforme discussão"
}
```

---

## ⚡ WebSocket

### **Conexão**
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Conectado ao WebSocket');
});
```

### **Chat Events**
```javascript
// Entrar em uma conversa
socket.emit('conversation:join', {
  conversationId: 'conv_123'
});

// Enviar mensagem
socket.emit('message:send', {
  conversationId: 'conv_123',
  content: 'Hello world!',
  type: 'TEXT'
});

// Escutar mensagens
socket.on('message:received', (message) => {
  console.log('Nova mensagem:', message);
});
```

---

## 🎣 Webhooks

### **Configuração**
```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/ioms",
  "events": [
    "outage.created",
    "outage.approved",
    "outage.rejected"
  ]
}
```

---

## 💡 Exemplo de Integração com Slack

```javascript
const { WebClient } = require('@slack/web-api');

const slack = new WebClient(process.env.SLACK_TOKEN);

// Webhook handler
app.post('/webhooks/ioms', async (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'outage.created') {
    await slack.chat.postMessage({
      channel: '#outages',
      text: `🚨 Nova outage criada: ${data.outage.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${data.outage.title}*\n${data.outage.description}`
          }
        }
      ]
    });
  }
  
  res.status(200).send('OK');
});
```

---

<div align="center">
  <p><strong>🔌 Integre facilmente com o IOMS</strong></p>
  <p><em>APIs robustas, WebSocket em tempo real e Webhooks confiáveis</em></p>
</div>

## O que foi implementado

### Backend (NestJS)
- ✅ **AppModule** principal configurado
- ✅ **CORS** configurado para permitir requisições do frontend
- ✅ **Validação global** com class-validator
- ✅ **Prefixo da API** configurado como `/api`
- ✅ **Interceptors** para logging e tratamento de exceções

### Frontend (React)
- ✅ **Serviços de API** criados (auth, outages, users)
- ✅ **Context de autenticação** implementado
- ✅ **Proteção de rotas** com verificação de autenticação
- ✅ **Interceptors** para tokens JWT e refresh automático
- ✅ **Configuração de proxy** no Vite
- ✅ **Login real** integrado com o backend

## Como executar

### 1. Backend
```bash
cd ioms-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações do banco
npx prisma migrate dev

# Iniciar em modo desenvolvimento
npm run start:dev
```

### 2. Frontend
```bash
cd ioms-frontend

# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm run dev
```

## Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ioms"
JWT_SECRET="seu-jwt-secret-aqui"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Estrutura de Integração

### Autenticação
- **Login**: POST `/api/auth/login`
- **Registro**: POST `/api/auth/register`
- **Refresh Token**: POST `/api/auth/refresh`
- **Logout**: POST `/api/auth/logout`
- **Usuário atual**: GET `/api/auth/me`

### Outages
- **Listar**: GET `/api/outages`
- **Criar**: POST `/api/outages`
- **Atualizar**: PUT `/api/outages/:id`
- **Aprovar**: PATCH `/api/outages/:id/approve`
- **Rejeitar**: PATCH `/api/outages/:id/reject`

### Usuários
- **Listar**: GET `/api/users`
- **Criar**: POST `/api/users`
- **Convidar**: POST `/api/users/invite`
- **Aceitar convite**: POST `/api/users/accept-invitation`

## Próximos Passos

### 1. Implementar endpoints faltantes no backend
- [ ] Endpoint `/auth/me` para obter usuário atual
- [ ] Endpoint `/auth/refresh` para renovar token
- [ ] Endpoints de outages com filtros
- [ ] Endpoints de usuários

### 2. Atualizar páginas do frontend
- [ ] Substituir dados mock por chamadas reais da API
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states
- [ ] Implementar paginação

### 3. Melhorias de UX
- [ ] Toast notifications para feedback
- [ ] Loading spinners
- [ ] Error boundaries
- [ ] Offline support

### 4. Segurança
- [ ] Rate limiting
- [ ] Validação de entrada
- [ ] Sanitização de dados
- [ ] HTTPS em produção

## Troubleshooting

### Erro de CORS
- Verificar se o backend está rodando na porta 3000
- Verificar se `FRONTEND_URL` está configurado corretamente

### Erro de autenticação
- Verificar se `JWT_SECRET` está configurado
- Verificar se os tokens estão sendo enviados corretamente

### Erro de banco de dados
- Verificar se o PostgreSQL está rodando
- Verificar se as migrações foram executadas
- Verificar se `DATABASE_URL` está correto 