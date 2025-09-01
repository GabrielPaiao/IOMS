const nodemailer = require('nodemailer');

async function setupTestEmail() {
  try {
    // Criar conta de teste Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('=== Credenciais de Email para Desenvolvimento ===');
    console.log('MAIL_HOST=smtp.ethereal.email');
    console.log('MAIL_PORT=587');
    console.log('MAIL_SECURE=false');
    console.log(`MAIL_USER=${testAccount.user}`);
    console.log(`MAIL_PASSWORD=${testAccount.pass}`);
    console.log('MAIL_FROM=noreply@ioms.local');
    console.log('MAIL_SUPPORT=support@ioms.local');
    console.log('APP_URL=http://localhost:5173');
    console.log('');
    console.log('🔗 Para visualizar emails enviados, acesse: https://ethereal.email');
    console.log(`📧 Login: ${testAccount.user}`);
    console.log(`🔑 Senha: ${testAccount.pass}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Copie as credenciais acima para o arquivo .env');
    
    return testAccount;
  } catch (error) {
    console.error('Erro ao criar conta de teste:', error);
  }
}

setupTestEmail();
