# 🌱 IOMS Database Seeder

Este diretório contém scripts para popular o banco de dados IOMS com dados de teste.

## 📋 Dados Criados

O seeder cria os seguintes dados de teste:

### 🏢 Empresas
- **Tech Solutions Ltd**: Empresa de desenvolvimento de software
- **Digital Innovations Corp**: Corporação de inovações digitais

### 👥 Usuários (Senha: `123456` para todos)
- `admin@techsolutions.com` - João Silva (ADMIN)
- `maria.santos@techsolutions.com` - Maria Santos (KEY_USER)
- `carlos.oliveira@techsolutions.com` - Carlos Oliveira (KEY_USER)
- `ana.costa@techsolutions.com` - Ana Costa (DEV)
- `admin@digitalinnovations.com` - Roberto Pereira (ADMIN)
- `lucia.ferreira@digitalinnovations.com` - Lúcia Ferreira (KEY_USER)

### 🚀 Aplicações
1. **E-commerce Platform** (Tech Solutions)
2. **CRM System** (Tech Solutions)  
3. **Mobile Banking App** (Tech Solutions)
4. **IoT Dashboard** (Digital Innovations)
5. **AI Analytics Platform** (Digital Innovations)

### 🌍 Ambientes e Localizações
- Cada aplicação possui múltiplos ambientes (DEV, QA, PROD, etc.)
- Localizações incluem AWS, Azure, GCP e data centers próprios

### ⚠️ Outages de Exemplo
- Outage concluída (manutenção do banco)
- Outage aprovada para deploy
- Outage pendente de aprovação
- Outage de migração de infraestrutura

## 🚀 Como Usar

### Opção 1: Executar apenas o seed
```bash
npm run db:seed
```

### Opção 2: Reset completo + seed
```bash
npm run db:seed-fresh
```

### Opção 3: Usando scripts personalizados

**Windows (PowerShell):**
```powershell
.\scripts\reset-and-seed.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/reset-and-seed.sh
./scripts/reset-and-seed.sh
```

## 🔧 Scripts Disponíveis

- `npm run db:seed` - Executa apenas o seeder
- `npm run db:seed-fresh` - Reset + migrações + seed
- `npm run db:studio` - Abre o Prisma Studio para visualizar dados
- `npm run db:reset` - Reset do banco (cuidado!)

## ⚠️ Importante

- **NUNCA execute em produção!** O seeder limpa todos os dados existentes
- Use apenas em ambiente de desenvolvimento/teste
- As senhas são todas `123456` - altere em produção
- Os dados são fictícios para fins de teste

## 🎯 Casos de Teste Cobertos

- Login com diferentes roles (ADMIN, KEY_USER, DEV)
- Visualização de aplicações por key users
- Outages em diferentes status
- Relacionamentos entre empresas, usuários e aplicações
- Ambientes e localizações diversificados
- Histórico de aprovações e outages

## 🔍 Visualizando os Dados

Após executar o seed, você pode:

1. **Fazer login na aplicação** com qualquer um dos usuários criados
2. **Usar o Prisma Studio**: `npm run db:studio`
3. **Verificar no banco diretamente** via cliente PostgreSQL

## 🛠️ Customizando o Seed

Para adicionar mais dados ou modificar os existentes, edite o arquivo `scripts/seed.ts` e execute novamente o seeder.
