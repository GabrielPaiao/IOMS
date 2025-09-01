const nodemailer = require('nodemailer');

async function testEmail() {
  // Configuração do transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: 'vtxf434rayrc5bi3@ethereal.email',
      pass: 'qgG3yVeAx48hJ2fqM2'
    }
  });

  try {
    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP está funcionando!');

    // Enviar email de teste
    const info = await transporter.sendMail({
      from: '"IOMS" <noreply@ioms.local>',
      to: 'teste@example.com',
      subject: 'Teste de Email - IOMS',
      text: 'Este é um teste de email para verificar se o sistema está funcionando.',
      html: `
        <h1>Teste de Email - IOMS</h1>
        <p>Este é um teste de email para verificar se o sistema está funcionando.</p>
        <p>Se você recebeu este email, a configuração está correta!</p>
      `
    });

    console.log('📧 Email enviado com sucesso!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
  }
}

testEmail();
