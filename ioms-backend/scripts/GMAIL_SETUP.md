# 📧 Script de Teste do Gmail SMTP

## 🔧 Configuração

### 1. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto backend:

```env
# Gmail SMTP Configuration
MAIL_USER=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-de-app-16-chars
TEST_EMAIL=email-para-teste@gmail.com  # Opcional - padrão é MAIL_USER
```

### 2. Como Gerar Senha de App do Gmail

1. **Ative a Autenticação de 2 Fatores:**
   - Vá para: [Conta Google - Segurança](https://myaccount.google.com/security)
   - Ative a "Verificação em duas etapas"

2. **Gere uma Senha de App:**
   - Acesse: [Senhas de App](https://myaccount.google.com/apppasswords)
   - Selecione "App personalizado"
   - Digite "IOMS" como nome
   - Copie a senha gerada (16 caracteres)

3. **Configure no .env:**
   ```env
   MAIL_USER=seuemail@gmail.com
   MAIL_PASSWORD=abcd efgh ijkl mnop  # Senha de app (não a senha normal!)
   ```

## 🚀 Como Usar

### Executar o Teste

```bash
cd ioms-backend
node scripts/test-gmail.js
```

### Saída Esperada

```
🧪 Testando Gmail SMTP...
📡 Verificando conexão SMTP...
✅ Conexão Gmail SMTP funcionando!
📧 Enviando email de teste...
✅ Email enviado com sucesso!
📧 Message ID: <message-id@gmail.com>
📬 Verifique sua caixa de entrada em: seuemail@gmail.com

🎯 Teste realizado com sucesso!
💡 Agora você pode testar convites reais através da aplicação.
```

## ❌ Solução de Problemas

### Erro de Autenticação (EAUTH)
```
❌ Erro: Variáveis de ambiente não configuradas!
📋 Configure no arquivo .env:
   MAIL_USER=seu-email@gmail.com
   MAIL_PASSWORD=sua-senha-de-app-16-chars
```

**Soluções:**
1. Verifique se o arquivo `.env` existe
2. Confirme que as variáveis estão corretas
3. Gere uma nova senha de app
4. Certifique-se de que a 2FA está ativa

### Erro de Envelope (EENVELOPE)
```
📧 Erro no envelope do email. Verifique:
   1. Email de destino está correto
   2. Formato do email é válido
```

### Outros Erros
```
🔧 Outras possíveis soluções:
   1. Verifique sua conexão com a internet
   2. Verifique se o Gmail não bloqueou o acesso
   3. Tente gerar uma nova senha de app
```

## 🔒 Segurança

- ✅ **Nunca commitar credenciais** no código
- ✅ **Usar variáveis de ambiente** (.env)
- ✅ **Usar senhas de app** (não a senha principal)
- ✅ **Manter o .env** no .gitignore

## 🧪 Próximos Passos

Após o teste ser bem-sucedido:

1. **Teste os convites na aplicação:**
   ```bash
   npm run start:dev
   ```

2. **Acesse a aplicação** e teste o envio de convites reais

3. **Configure o email de produção** quando necessário

---

**⚠️ IMPORTANTE:** Este script é apenas para teste. Em produção, use um email dedicado para o sistema.
