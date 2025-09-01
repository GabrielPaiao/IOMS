const axios = require('axios');

async function testInvite() {
  try {
    console.log('🧪 Testando envio de convite...');
    
    // Primeiro fazer login para obter o token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@test.com', // Substitua pelo email do admin
      password: 'password123'  // Substitua pela senha do admin
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login realizado com sucesso');
    
    // Agora enviar o convite
    const inviteResponse = await axios.post('http://localhost:3000/api/users/invite', {
      email: 'teste@gmail.com', // Substitua pelo seu email pessoal
      role: 'USER'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Convite enviado:', inviteResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testInvite();
