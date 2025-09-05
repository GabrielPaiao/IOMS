const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmailSMTP() {
  console.log('🧪 Testando Gmail SMTP...');
  
  // Verificar se as variáveis de ambiente estão configuradas
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASSWORD || process.env.MAIL_PASS;
  const testEmail = process.env.TEST_EMAIL || mailUser;
  
  if (!mailUser || !mailPass) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas!');
    console.error('📋 Configure no arquivo .env:');
    console.error('   MAIL_USER=seu-email@gmail.com');
    console.error('   MAIL_PASSWORD=sua-senha-de-app-16-chars');
    console.error('   TEST_EMAIL=email-para-teste@gmail.com (opcional)');
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: mailUser,
      pass: mailPass
    }
  });

  try {
    // Verificar conexão
    console.log('📡 Verificando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão Gmail SMTP funcionando!');

    // Enviar email de teste
    console.log('📧 Enviando email de teste...');
    const info = await transporter.sendMail({
      from: `"IOMS - Sistema de Gestão" <${mailUser}>`,
      to: testEmail,
      subject: 'Teste Gmail SMTP - IOMS',
      text: 'Este é um teste para verificar se o Gmail SMTP está funcionando.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">🎉 Gmail SMTP Funcionando!</h1>
          <p>Este é um email de teste enviado através do Gmail SMTP para verificar se a configuração está funcionando corretamente.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ Configuração Ativa:</h3>
            <ul>
              <li><strong>Servidor:</strong> smtp.gmail.com:587</li>
              <li><strong>Remetente:</strong> ${mailUser}</li>
              <li><strong>Sistema:</strong> IOMS - Gestão de Outages</li>
            </ul>
          </div>
          <p><strong>Próximo passo:</strong> Enviar convites reais através da aplicação!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Teste automático do sistema IOMS<br>
            Data: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log(`📬 Verifique sua caixa de entrada em: ${testEmail}`);
    console.log('');
    console.log('🎯 Teste realizado com sucesso!');
    console.log('💡 Agora você pode testar convites reais através da aplicação.');
    
  } catch (error) {
    console.error('❌ Erro ao testar Gmail SMTP:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Erro de autenticação. Verifique:');
      console.error('   1. Email está correto no .env');
      console.error('   2. Senha de app está correta (16 caracteres)');
      console.error('   3. Autenticação 2FA está ativada no Gmail');
      console.error('   4. Senha de app foi gerada recentemente');
    } else if (error.code === 'EENVELOPE') {
      console.error('📧 Erro no envelope do email. Verifique:');
      console.error('   1. Email de destino está correto');
      console.error('   2. Formato do email é válido');
    } else {
      console.error('🔧 Outras possíveis soluções:');
      console.error('   1. Verifique sua conexão com a internet');
      console.error('   2. Verifique se o Gmail não bloqueou o acesso');
      console.error('   3. Tente gerar uma nova senha de app');
    }
  }
}

testGmailSMTP();
