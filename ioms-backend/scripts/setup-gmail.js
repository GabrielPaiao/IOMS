/**
 * Script para configurar Gmail SMTP
 * 
 * IMPORTANTE: Para usar Gmail SMTP, você precisa:
 * 
 * 1. Ativar autenticação de 2 fatores na sua conta Google
 * 2. Gerar uma "Senha de App" específica para este aplicativo
 * 
 * COMO GERAR SENHA DE APP:
 * 1. Vá para: https://myaccount.google.com/security
 * 2. Clique em "Verificação em duas etapas"
 * 3. Role para baixo e clique em "Senhas de app"
 * 4. Selecione "App personalizado" e digite "IOMS"
 * 5. Copie a senha gerada (16 caracteres)
 * 6. Use essa senha no .env, não a senha normal do Gmail
 * 
 * CONFIGURAÇÃO NO .env:
 * MAIL_USER=seuemail@gmail.com
 * MAIL_PASSWORD=abcd efgh ijkl mnop  (senha de app de 16 dígitos)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupGmailSMTP() {
  console.log('🔧 Configuração do Gmail SMTP para IOMS\n');
  
  console.log('📋 PRÉ-REQUISITOS:');
  console.log('1. ✅ Conta Gmail com autenticação 2FA ativada');
  console.log('2. ✅ Senha de app gerada (16 caracteres)');
  console.log('3. ✅ Link: https://myaccount.google.com/apppasswords\n');
  
  const email = await askQuestion('📧 Digite seu email Gmail: ');
  const appPassword = await askQuestion('🔑 Digite a senha de app (16 caracteres): ');
  
  // Validar formato do email
  if (!email.includes('@gmail.com')) {
    console.log('❌ Por favor, use um email @gmail.com');
    process.exit(1);
  }
  
  // Validar senha de app (normalmente 16 caracteres)
  if (appPassword.replace(/\s/g, '').length !== 16) {
    console.log('⚠️  Aviso: Senha de app geralmente tem 16 caracteres');
  }
  
  // Ler o arquivo .env atual
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Substituir as configurações de email
  envContent = envContent.replace(/MAIL_USER=.*/, `MAIL_USER=${email}`);
  envContent = envContent.replace(/MAIL_PASSWORD=.*/, `MAIL_PASSWORD=${appPassword}`);
  envContent = envContent.replace(/MAIL_FROM=.*/, `MAIL_FROM="IOMS - Sistema de Gestão <${email}>"`);
  
  // Salvar o arquivo .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Configuração salva com sucesso!');
  console.log('\n📄 Configuração aplicada:');
  console.log(`   📧 Email: ${email}`);
  console.log(`   🔐 Senha: ${'*'.repeat(appPassword.length)}`);
  console.log(`   📡 SMTP: smtp.gmail.com:587`);
  
  console.log('\n🔄 Reinicie o backend para aplicar as mudanças');
  console.log('💡 Comando: npm run start:dev\n');
  
  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

setupGmailSMTP().catch(console.error);
