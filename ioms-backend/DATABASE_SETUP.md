# 🗄️ Configuração do Banco de Dados - IOMS

Este guia te ajudará a configurar o banco de dados PostgreSQL para o sistema IOMS.

## 📋 Pré-requisitos

### 1. PostgreSQL
- **Versão**: 12 ou superior
- **Porta**: 5432 (padrão)
- **Usuário**: postgres (padrão)

### 2. Node.js
- **Versão**: 18 ou superior
- **npm**: 9 ou superior

## 🚀 Configuração Rápida

### Opção 1: Script Automático (Recomendado)
```bash
# No diretório ioms-backend
npm run db:setup
```

### Opção 2: Configuração Manual
```bash
# 1. Gerar cliente Prisma
npm run db:generate

# 2. Executar migrações
npm run db:migrate

# 3. (Opcional) Executar seed
npm run db:seed
```

## ⚙️ Configuração Manual Detalhada

### 1. Instalar PostgreSQL

#### Windows
```bash
# Baixar do site oficial: https://www.postgresql.org/download/windows/
# Ou usar Chocolatey:
choco install postgresql
```

#### macOS
```bash
# Usar Homebrew:
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configurar PostgreSQL

```bash
# Acessar como usuário postgres
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE ioms_db;

# Criar usuário (opcional)
CREATE USER ioms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ioms_db TO ioms_user;

# Sair
\q
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/ioms_db?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ioms_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Executar Migrações

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# Verificar status
npx prisma migrate status
```

## 🔧 Comandos Úteis

### Gerenciamento do Banco
```bash
# Setup completo
npm run db:setup

# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Resetar banco
npm run db:reset

# Abrir Prisma Studio
npm run db:studio

# Push direto (sem migrações)
npm run db:push
```

### Verificação
```bash
# Verificar conexão
npx prisma db pull

# Verificar schema
npx prisma validate

# Verificar migrações
npx prisma migrate status
```

## 🐛 Solução de Problemas

### Erro: "Connection refused"
- Verifique se o PostgreSQL está rodando
- Verifique a porta (5432)
- Verifique as credenciais

### Erro: "Database does not exist"
```bash
# Criar banco manualmente
createdb -h localhost -U postgres ioms_db
```

### Erro: "Permission denied"
```bash
# Verificar permissões do usuário postgres
sudo -u postgres psql
\du
```

### Erro: "Prisma Client not generated"
```bash
# Regenerar cliente
npx prisma generate
```

## 📊 Estrutura do Banco

O sistema IOMS inclui as seguintes tabelas principais:

- **users** - Usuários do sistema
- **companies** - Empresas
- **applications** - Aplicações
- **outages** - Interrupções de serviço
- **approval_workflows** - Fluxos de aprovação
- **notifications** - Notificações
- **chat_conversations** - Conversas de chat
- **chat_messages** - Mensagens de chat
- **chat_participants** - Participantes do chat

## 🚀 Próximos Passos

Após configurar o banco:

1. **Iniciar o servidor**:
   ```bash
   npm run start:dev
   ```

2. **Acessar a API**:
   - REST: http://localhost:3001/api
   - WebSocket: ws://localhost:3001/chat

3. **Verificar banco**:
   ```bash
   npm run db:studio
   ```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do PostgreSQL
2. Verifique as variáveis de ambiente
3. Execute `npm run db:setup` para diagnóstico
4. Consulte a documentação do Prisma: https://www.prisma.io/docs

---

**🎉 Parabéns!** Seu banco de dados está configurado e pronto para uso.
