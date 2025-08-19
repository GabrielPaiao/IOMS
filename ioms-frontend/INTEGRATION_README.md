# Integração Frontend-Backend - IOMS

Este documento descreve a implementação da integração completa entre o frontend React e o backend NestJS para o sistema IOMS.

## 🚀 Funcionalidades Implementadas

### 1. **Autenticação Completa**
- ✅ Login com email/senha
- ✅ Registro de administradores
- ✅ Refresh token automático
- ✅ Gerenciamento de sessão
- ✅ Proteção de rotas

### 2. **Gestão de Outages**
- ✅ CRUD completo de outages
- ✅ Filtros avançados
- ✅ Aprovação/rejeição
- ✅ Auto-refresh dos dados
- ✅ Permissões baseadas em roles

### 3. **Sistema de Usuários**
- ✅ Convites de usuários
- ✅ Gerenciamento de perfis
- ✅ Roles e permissões
- ✅ Integração com empresas

### 4. **Dados Mestres**
- ✅ Aplicações
- ✅ Localizações
- ✅ Ambientes
- ✅ Integração com outages

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend:

```bash
# Configuração da API
VITE_API_URL=http://localhost:3000/api

# Configurações da aplicação
VITE_APP_NAME=IOMS
VITE_APP_VERSION=1.0.0
```

### Backend

Certifique-se de que o backend está rodando na porta 3000:

```bash
cd ioms-backend
npm run start:dev
```

## 📁 Estrutura dos Serviços

### API Service (`src/services/api.ts`)
- Configuração base do Axios
- Interceptors para autenticação
- Refresh token automático
- Tratamento de erros 401

### Auth Service (`src/services/auth.service.ts`)
- Login/Logout
- Registro de administradores
- Refresh token
- Gerenciamento de tokens

### Outages Service (`src/services/outages.service.ts`)
- CRUD de outages
- Aprovação/rejeição
- Filtros e busca
- Integração com dados mestres

### Users Service (`src/services/users.service.ts`)
- Gerenciamento de usuários
- Sistema de convites
- Perfis e permissões

### Master Data Service (`src/services/masterdata.service.ts`)
- Aplicações
- Localizações
- Ambientes
- Dados compartilhados

## 🎣 Hooks Personalizados

### useOutages
```typescript
const {
  outages,
  isLoading,
  error,
  createOutage,
  updateOutage,
  deleteOutage,
  approveOutage,
  rejectOutage,
  applyFilters,
  clearFilters,
  refresh
} = useOutages({
  companyId: user?.companyId,
  autoRefresh: true,
  refreshInterval: 30000
});
```

## 🔐 Autenticação e Autorização

### Fluxo de Login
1. Usuário submete credenciais
2. Backend valida e retorna tokens
3. Frontend armazena tokens no localStorage
4. Interceptor adiciona token em todas as requisições

### Refresh Token Automático
1. Interceptor detecta erro 401
2. Tenta renovar token automaticamente
3. Repete requisição original com novo token
4. Redireciona para login se falhar

### Proteção de Rotas
- `ProtectedRoute` verifica autenticação
- `RolesGuard` verifica permissões
- Redirecionamento automático para login

## 📊 Gestão de Estado

### Context API
- `AuthContext` para autenticação global
- Estado do usuário logado
- Funções de login/logout/registro

### Hooks Personalizados
- `useOutages` para gestão de outages
- Estado local com sincronização automática
- Cache e otimizações de performance

## 🚨 Tratamento de Erros

### Níveis de Tratamento
1. **Serviços**: Capturam erros da API
2. **Hooks**: Gerenciam estado de erro
3. **Componentes**: Exibem mensagens amigáveis
4. **Interceptors**: Tratam erros de autenticação

### Mensagens de Erro
- Validação de formulários
- Erros de rede
- Erros de autenticação
- Erros de permissão

## 🔄 Sincronização de Dados

### Auto-Refresh
- Outages atualizam automaticamente
- Configurável por componente
- Otimizado para performance

### Cache Inteligente
- Dados mestres em cache
- Invalidação automática
- Sincronização em tempo real

## 🧪 Testes

### Executar Testes
```bash
# Frontend
npm run test

# Backend
npm run test
```

### Cobertura
- Serviços de API
- Hooks personalizados
- Componentes principais
- Integração end-to-end

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Variáveis de Produção
```bash
VITE_API_URL=https://api.seudominio.com/api
VITE_APP_NAME=IOMS
VITE_APP_VERSION=1.0.0
```

## 📝 Logs e Monitoramento

### Console Logs
- Erros de API
- Operações de autenticação
- Performance de requisições

### Métricas
- Tempo de resposta da API
- Taxa de sucesso das requisições
- Uso de cache

## 🔒 Segurança

### Tokens
- Armazenamento seguro no localStorage
- Expiração automática
- Renovação transparente

### Validação
- Validação no frontend
- Validação no backend
- Sanitização de dados

### CORS
- Configuração adequada no backend
- Headers de segurança
- Política de origem

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. **Erro 401 persistente**
- Verificar se o refresh token está válido
- Limpar localStorage e fazer login novamente
- Verificar configuração do backend

#### 2. **Dados não carregam**
- Verificar se a API está rodando
- Verificar se o usuário está autenticado
- Verificar permissões do usuário

#### 3. **Refresh token não funciona**
- Verificar rota `/auth/refresh-token` no backend
- Verificar formato do payload
- Verificar logs do backend

### Debug
```typescript
// Habilitar logs detalhados
localStorage.setItem('debug', 'true');

// Verificar tokens
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

## 📚 Recursos Adicionais

### Documentação da API
- Swagger UI: `http://localhost:3000/api/docs`
- Endpoints documentados
- Schemas de dados

### Bibliotecas Utilizadas
- **Axios**: Cliente HTTP
- **React Router**: Roteamento
- **Context API**: Estado global
- **TypeScript**: Tipagem estática

### Padrões de Código
- ESLint + Prettier
- Husky para pre-commit hooks
- Conventional Commits
- Componentes funcionais com hooks

## 🤝 Contribuição

### Fluxo de Desenvolvimento
1. Criar branch feature
2. Implementar funcionalidade
3. Adicionar testes
4. Fazer pull request
5. Code review
6. Merge para main

### Padrões de Commit
```
feat: adiciona integração com backend
fix: corrige refresh token automático
docs: atualiza documentação de integração
test: adiciona testes para useOutages
```

---

**Status**: ✅ **INTEGRAÇÃO COMPLETA**

A integração frontend-backend está 100% funcional com todas as funcionalidades implementadas e testadas.
