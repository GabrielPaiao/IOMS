const fs = require('fs');
const path = require('path');

// Script para copiar templates .hbs para a pasta dist
const srcDir = path.join(__dirname, 'src', 'mail', 'templates');
const distDir = path.join(__dirname, 'dist', 'src', 'mail', 'templates');

// Criar diretório de destino se não existir
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copiar todos os arquivos .hbs
if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.hbs'));
    
    files.forEach(file => {
        const srcFile = path.join(srcDir, file);
        const distFile = path.join(distDir, file);
        fs.copyFileSync(srcFile, distFile);
        console.log(`✅ Copiado: ${file}`);
    });
    
    console.log(`📧 Templates copiados: ${files.length} arquivos`);
} else {
    console.log('⚠️ Pasta de templates não encontrada');
}
