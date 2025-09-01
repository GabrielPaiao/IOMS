import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Teste da Aplicação</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
      <button onClick={() => alert('Botão funcionando!')}>
        Clique aqui
      </button>
    </div>
  );
}

export default TestApp;
