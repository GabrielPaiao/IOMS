# 🔒 GUIA DE CONFIGURAÇÃO DE SEGURANÇA - IOMS

## 📋 Implementações de Segurança da Fase 1

### ✅ **Rate Limiting**
- **Global**: 10 req/s, 100 req/min, 1000 req/15min
- **Login**: 5 tentativas por minuto
- **Biblioteca**: @nestjs/throttler

### ✅ **Security Headers (Helmet)**
- HSTS (HTTP Strict Transport Security)
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer Policy: same-origin

### ✅ **HTTPS Configuration**
- Auto-detecção de certificados SSL
- Fallback para HTTP em desenvolvimento
- Bloqueio obrigatório em produção

### ✅ **CORS Melhorado**
- Restritivo para produção
- Configurável via variáveis de ambiente

## 🔧 Configuração para Produção

### **Variáveis de Ambiente Obrigatórias**

```bash
# Produção
NODE_ENV=production

# HTTPS
ENABLE_HTTPS=true
SSL_KEY_PATH=/path/to/ssl/key.pem
SSL_CERT_PATH=/path/to/ssl/cert.pem

# CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Porta
PORT=3000
```

### **Gerar Certificados SSL para Produção**

```bash
# Let's Encrypt (recomendado)
sudo certbot certonly --nginx -d your-domain.com

# Ou certificado auto-assinado (apenas desenvolvimento)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## 🚨 Alertas de Segurança

### **⚠️ Vulnerabilidades Conhecidas**
- 32 vulnerabilidades HIGH no MJML (sistema de email)
- Recomendação: Atualizar ou substituir sistema de email

### **🔍 Próximas Implementações (Fase 2)**
- [ ] Refresh token rotation
- [ ] JWT blacklist
- [ ] Auditoria de logs de segurança
- [ ] Detecção de brute force
- [ ] Input sanitization avançada

## 📊 Monitoramento de Segurança

### **Rate Limiting Logs**
- Monitore logs de throttling para detectar ataques
- Configure alertas para múltiplas violações

### **Security Headers Validation**
- Use ferramentas como SecurityHeaders.com
- Valide CSP regularmente

### **HTTPS Monitoring**
- Monitore expiração de certificados
- Configure renovação automática

## 🎯 Checklist de Deploy Seguro

### **Antes do Deploy**
- [ ] Variáveis de ambiente configuradas
- [ ] Certificados SSL válidos
- [ ] CORS origins corretos
- [ ] Rate limits apropriados
- [ ] Vulnerability scan executado

### **Após o Deploy**
- [ ] HTTPS funcional
- [ ] Security headers verificados
- [ ] Rate limiting testado
- [ ] Logs de segurança funcionando
- [ ] Monitoring ativo

## 📞 Suporte e Manutenção

### **Atualizações de Segurança**
- Execute `npm audit` semanalmente
- Aplique patches críticos imediatamente
- Monitore CVE databases

### **Backup de Configurações**
- Mantenha backup dos certificados SSL
- Documente configurações de produção
- Versione arquivos de configuração

---

**Última atualização**: September 2, 2025
**Versão**: Fase 1 - Implementações Críticas
