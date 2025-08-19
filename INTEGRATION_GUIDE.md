# Guia de Integração Frontend-Backend IOMS

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