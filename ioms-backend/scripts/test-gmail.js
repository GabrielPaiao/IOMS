const nodemailer = require('nodemailer');

async function testGmailSMTP() {
  console.log('🧪 Testando Gmail SMTP...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: 'bielpaiao8@gmail.com',
      pass: 'nzhg gzjv iusl gztg'
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
      from: '"IOMS - Sistema de Gestão" <iomsmessages@gmail.com>',
      to: 'bielpaiao8@gmail.com',
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
              <li><strong>Remetente:</strong> iomsmessages@gmail.com</li>
              <li><strong>Sistema:</strong> IOMS - Gestão de Outages</li>
            </ul>
          </div>
          <p><strong>Próximo passo:</strong> Enviar convites reais através da aplicação!</p>
        </div>
      `
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Verifique sua caixa de entrada em: bielpaiao8@gmail.com');
    
  } catch (error) {
    console.error('❌ Erro ao testar Gmail SMTP:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Erro de autenticação. Verifique:');
      console.error('   1. Email está correto');
      console.error('   2. Senha de app está correta (16 caracteres)');
      console.error('   3. Autenticação 2FA está ativada');
    }
  }
}

testGmailSMTP();
