# 🚀 INSTALAÇÃO RÁPIDA - PostgreSQL para IOMS

## ❌ **PROBLEMA IDENTIFICADO**
O PostgreSQL não está instalado no seu sistema Windows.

## ✅ **SOLUÇÃO RÁPIDA**

### **Opção 1: Script Automático (Recomendado)**
```bash
# Execute como Administrador no PowerShell
npm run postgres:install
```

### **Opção 2: Script Simples**
```bash
# Abre o navegador para download
npm run postgres:install:simple
```

### **Opção 3: Instalação Manual**

1. **Baixar PostgreSQL**:
   - Acesse: https://www.postgresql.org/download/windows/
   - Baixe a versão 15.5 ou superior

2. **Instalar**:
   - Execute o instalador como Administrador
   - **IMPORTANTE**: Use a senha `password` para o usuário postgres
   - Mantenha a porta padrão 5432
   - Mantenha as outras opções padrão

3. **Verificar instalação**:
   ```bash
   psql --version
   ```

## 🔧 **APÓS INSTALAR O POSTGRESQL**

### **1. Configurar variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto com:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ioms_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### **2. Configurar o banco**
```bash
# Setup automático completo
npm run db:setup

# Ou manualmente:
npm run db:generate
npm run db:migrate
```

### **3. Testar o sistema**
```bash
# Iniciar servidor
npm run start:dev

# Abrir Prisma Studio (interface visual do banco)
npm run db:studio
```

## 🐛 **SOLUÇÃO DE PROBLEMAS COMUNS**

### **Erro: "psql não é reconhecido"**
- O PostgreSQL não está no PATH
- Reinicie o terminal após a instalação
- Ou adicione manualmente ao PATH: `C:\Program Files\PostgreSQL\15\bin`

### **Erro: "Connection refused"**
- Verifique se o serviço PostgreSQL está rodando
- Abra "Serviços" do Windows e procure por "postgresql"

### **Erro: "Authentication failed"**
- A senha está incorreta
- Use `password` como senha (conforme configurado no script)

### **Erro: "Port already in use"**
- Outro serviço está usando a porta 5432
- Mude a porta no PostgreSQL ou pare o outro serviço

## 📱 **COMANDOS ÚTEIS**

```bash
# Verificar se PostgreSQL está instalado
psql --version

# Verificar se está rodando
pg_isready -h localhost -p 5432

# Conectar ao banco
psql -h localhost -U postgres -d postgres

# Verificar serviços
Get-Service postgresql*
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Instale o PostgreSQL** usando um dos métodos acima
2. **Configure o arquivo .env**
3. **Execute: `npm run db:setup`**
4. **Teste: `npm run start:dev`**

## 📞 **PRECISA DE AJUDA?**

Se ainda tiver problemas:
1. Verifique se executou como Administrador
2. Verifique se o PostgreSQL está rodando
3. Execute `npm run db:setup` para diagnóstico
4. Consulte o `DATABASE_SETUP.md` completo

---

**🎉 Após resolver, você terá um sistema de chat completo funcionando!**
