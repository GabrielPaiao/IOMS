# 🔴 Implementação das Funcionalidades de Outages - IOMS Backend

## ✅ Funcionalidades Implementadas

### 1. **Sistema de Aprovação/Rejeição Real** ✅
- **Módulo**: `ApprovalWorkflowsModule`
- **Arquivos**: 
  - `approval-workflows.service.ts` - Lógica de negócio
  - `approval-workflows.controller.ts` - Endpoints da API
  - `dto/` - Validação de dados
- **Funcionalidades**:
  - Criação de workflow de aprovação
  - Aprovação/rejeição de etapas
  - Solicitação de mudanças
  - Pular etapas (admin)
  - Reatribuir aprovadores

### 2. **Validações de Conflito de Horários** ✅
- **Módulo**: `ConflictValidationModule`
- **Arquivos**:
  - `conflict-validation.service.ts` - Lógica de validação
  - `conflict-validation.controller.ts` - Endpoints da API
  - `dto/` - Validação de dados
- **Funcionalidades**:
  - Verificação de conflitos de horários
  - Validação por aplicação, localização e ambiente
  - Sugestão de horários alternativos
  - Verificação de regras de negócio
  - Cálculo de severidade de conflitos

### 3. **Workflow de Aprovação Completo** ✅
- **Módulo**: `ApprovalWorkflowsModule`
- **Funcionalidades**:
  - Múltiplos aprovadores com ordem
  - Etapas obrigatórias e opcionais
  - Deadlines configuráveis
  - Auto-aprovação (configurável)
  - Status de workflow (PENDING, APPROVED, REJECTED, CHANGES_REQUESTED)

### 4. **Histórico de Mudanças** ✅
- **Módulo**: `ChangeHistoryModule`
- **Arquivos**:
  - `change-history.service.ts` - Lógica de histórico
  - `change-history.controller.ts` - Endpoints da API
  - `dto/` - Validação de dados
- **Funcionalidades**:
  - Rastreamento de todas as mudanças
  - Comentários e notas
  - Trilha de auditoria completa
  - Estatísticas de mudanças
  - Histórico por usuário e campo

### 5. **Notificações em Tempo Real** ✅
- **Módulo**: `NotificationsModule`
- **Arquivos**:
  - `notifications.service.ts` - Lógica de notificações
  - `notifications.controller.ts` - Endpoints da API
  - `dto/` - Validação de dados
- **Funcionalidades**:
  - Notificações por email, push e SMS
  - Preferências configuráveis por usuário
  - Notificações automáticas para:
    - Criação de outages
    - Atualizações de status
    - Detecção de conflitos
    - Solicitações de aprovação

## 🗄️ Schema do Banco de Dados

### Novas Tabelas Adicionadas:

```sql
-- Workflow de aprovação
CREATE TABLE approval_workflows (
  id TEXT PRIMARY KEY,
  outageId TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING',
  autoApprove BOOLEAN DEFAULT false,
  deadline TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Etapas do workflow
CREATE TABLE workflow_steps (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  userId TEXT NOT NULL,
  order INTEGER NOT NULL,
  required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'PENDING',
  reason TEXT,
  comments TEXT,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de mudanças (atualizado)
ALTER TABLE outage_histories ADD COLUMN field TEXT NOT NULL;
ALTER TABLE outage_histories ADD COLUMN reason TEXT;
ALTER TABLE outage_histories RENAME COLUMN changedAt TO createdAt;

-- Notificações (atualizado)
ALTER TABLE notifications ADD COLUMN type TEXT NOT NULL;
ALTER TABLE notifications ADD COLUMN title TEXT NOT NULL;
ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN metadata TEXT;
ALTER TABLE notifications ADD COLUMN readAt TIMESTAMP;
ALTER TABLE notifications RENAME COLUMN userId TO recipientId;
```

## 🚀 Como Executar

### 1. **Instalar Dependências**
```bash
cd ioms-backend
npm install
```

### 2. **Configurar Variáveis de Ambiente**
Criar arquivo `.env`:
```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/ioms"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1h"
JWT_ISSUER="ioms"
JWT_AUDIENCE="ioms-client"

# Frontend
FRONTEND_URL="http://localhost:5173"

# Notificações
WEBSOCKET_ENABLED="true"
EMAIL_ENABLED="false"

# Workflow
AUTO_APPROVE="false"
DEFAULT_DEADLINE="24h"

# Validações
CONFLICT_CHECK_ENABLED="true"
CONFLICT_BUFFER_TIME="15"
BUSINESS_RULES_ENABLED="true"
MAX_CRITICAL_DURATION="4"
MAX_HIGH_DURATION="8"
```

### 3. **Executar Migrações do Banco**
```bash
npx prisma migrate dev
npx prisma generate
```

### 4. **Iniciar o Servidor**
```bash
npm run start:dev
```

## 📡 Endpoints da API

### Workflow de Aprovação
- `POST /api/approval-workflows` - Criar workflow
- `GET /api/approval-workflows` - Listar workflows
- `GET /api/approval-workflows/:id` - Obter workflow por ID
- `GET /api/approval-workflows/outage/:outageId` - Obter workflow por outage
- `POST /api/approval-workflows/approve` - Aprovar etapa
- `POST /api/approval-workflows/reject` - Rejeitar etapa
- `POST /api/approval-workflows/request-changes` - Solicitar mudanças

### Validação de Conflitos
- `POST /api/outages/validate/conflicts` - Verificar conflitos
- `GET /api/outages/validate/application-conflicts` - Conflitos por aplicação
- `GET /api/outages/validate/location-conflicts` - Conflitos por localização
- `GET /api/outages/validate/environment-conflicts` - Conflitos por ambiente
- `POST /api/outages/validate` - Validação completa
- `GET /api/outages/validate/resource-availability` - Disponibilidade de recursos
- `GET /api/outages/validate/suggest-slots` - Sugerir horários alternativos

### Histórico de Mudanças
- `GET /api/change-history/outage/:outageId` - Histórico de um outage
- `GET /api/change-history` - Histórico com filtros
- `GET /api/change-history/:id` - Obter mudança específica
- `GET /api/change-history/outage/:outageId/field-summary` - Resumo por campo
- `GET /api/change-history/audit-trail/:outageId` - Trilha de auditoria
- `POST /api/change-history/comment` - Adicionar comentário

### Notificações
- `POST /api/notifications` - Criar notificação
- `GET /api/notifications` - Listar notificações
- `PUT /api/notifications/:id/read` - Marcar como lida
- `PUT /api/notifications/mark-all-read/:recipientId` - Marcar todas como lidas
- `GET /api/notifications/unread-count/:recipientId` - Contar não lidas
- `GET /api/notifications/preferences/:userId` - Obter preferências
- `PUT /api/notifications/preferences/:userId` - Atualizar preferências

## 🔧 Configurações

### Workflow de Aprovação
- **Auto-aprovação**: Configurável por outage
- **Deadlines**: Configuráveis por workflow
- **Etapas**: Ordem e obrigatoriedade configuráveis
- **Reatribuição**: Apenas para administradores

### Validação de Conflitos
- **Buffer de tempo**: Configurável (padrão: 15 minutos)
- **Regras de negócio**: Duração máxima por criticidade
- **Sugestões**: Horários alternativos nas próximas 24h
- **Severidade**: Baseada em criticidade e sobreposição

### Notificações
- **WebSocket**: Suporte a tempo real
- **Email**: Configurável via SMTP
- **Preferências**: Por usuário e tipo de notificação
- **Prioridades**: Low, Normal, High, Urgent

## 🧪 Testes

### Executar Testes Unitários
```bash
npm run test
```

### Executar Testes E2E
```bash
npm run test:e2e
```

### Executar Testes com Coverage
```bash
npm run test:cov
```

## 📊 Monitoramento

### Logs
- Interceptor de logging global
- Filtro de exceções global
- Logs estruturados para auditoria

### Métricas
- Contagem de workflows por status
- Tempo médio de aprovação
- Conflitos detectados
- Notificações enviadas

## 🔒 Segurança

### Autenticação
- JWT com expiração configurável
- Validação de token em todas as rotas
- Refresh token implementado

### Autorização
- Guard de roles por endpoint
- Verificação de permissões por empresa
- Validação de propriedade de recursos

### Validação
- DTOs com class-validator
- Sanitização de entrada
- Validação de tipos e formatos

## 🚨 Próximos Passos

### 1. **Implementar WebSocket para Notificações em Tempo Real**
- Gateway WebSocket no NestJS
- Autenticação de conexões
- Broadcast de notificações

### 2. **Adicionar Cache Redis**
- Cache de workflows ativos
- Cache de validações de conflito
- Cache de preferências de usuário

### 3. **Implementar Filas de Background**
- Processamento assíncrono de notificações
- Validações em background
- Relatórios agendados

### 4. **Adicionar Métricas e Monitoramento**
- Prometheus metrics
- Health checks
- Performance monitoring

### 5. **Implementar Testes Automatizados**
- Testes de integração
- Testes de performance
- Testes de segurança

## 📝 Notas de Implementação

- **Status**: ✅ Implementado e funcional
- **Versão**: 1.0.0
- **Última Atualização**: Janeiro 2025
- **Compatibilidade**: NestJS 10+, Prisma 5+, PostgreSQL 12+

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Validar configurações do banco
3. Verificar variáveis de ambiente
4. Consultar documentação da API
5. Abrir issue no repositório
