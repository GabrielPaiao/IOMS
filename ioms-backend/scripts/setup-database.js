#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando banco de dados para IOMS...\n');

// Verificar se o PostgreSQL está rodando
function checkPostgreSQL() {
  try {
    // Pular verificação para Docker
    console.log('✅ PostgreSQL Docker assumido como rodando na porta 5434');
    return true;
  } catch (error) {
    console.log('❌ Erro na verificação do PostgreSQL');
    return false;
  }
}

// Criar banco de dados se não existir
function createDatabase() {
  try {
    console.log('📦 Criando banco de dados...');
    
    // Usar Docker para criar o banco
    execSync('docker exec ioms-postgres createdb -U postgres ioms_db', { 
      stdio: 'pipe'
    });
    console.log('✅ Banco de dados criado com sucesso');
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Banco de dados já existe');
      return true;
    } else {
      console.log('❌ Erro ao criar banco de dados:', error.message);
      console.log('   Certifique-se de que o container Docker está rodando');
      return false;
    }
  }
}

// Gerar cliente Prisma
function generatePrismaClient() {
  try {
    console.log('🔧 Gerando cliente Prisma...');
    execSync('npx prisma generate --schema=src/shared/prisma/schema.prisma', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma gerado com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Erro ao gerar cliente Prisma:', error.message);
    return false;
  }
}

// Executar migrações
function runMigrations() {
  try {
    console.log('🔄 Executando migrações...');
    execSync('npx prisma migrate dev --schema=src/shared/prisma/schema.prisma --name init', { stdio: 'inherit' });
    console.log('✅ Migrações executadas com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Erro ao executar migrações:', error.message);
    return false;
  }
}

// Seed do banco (opcional)
function seedDatabase() {
  try {
    console.log('🌱 Executando seed do banco...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Seed executado com sucesso');
    return true;
  } catch (error) {
    console.log('⚠️  Seed não executado (opcional):', error.message);
    return true; // Seed é opcional
  }
}

// Função principal
async function main() {
  console.log('📋 Verificando pré-requisitos...\n');

  // Verificar PostgreSQL
  if (!checkPostgreSQL()) {
    console.log('\n❌ Configuração falhou. Verifique o PostgreSQL e tente novamente.');
    process.exit(1);
  }

  // Criar banco
  if (!createDatabase()) {
    console.log('\n❌ Configuração falhou. Verifique as permissões e tente novamente.');
    process.exit(1);
  }

  // Gerar cliente Prisma
  if (!generatePrismaClient()) {
    console.log('\n❌ Configuração falhou. Verifique o Prisma e tente novamente.');
    process.exit(1);
  }

  // Executar migrações
  if (!runMigrations()) {
    console.log('\n❌ Configuração falhou. Verifique as migrações e tente novamente.');
    process.exit(1);
  }

  // Executar seed (opcional)
  seedDatabase();

  console.log('\n🎉 Configuração do banco de dados concluída com sucesso!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Configure as variáveis de ambiente no arquivo .env');
  console.log('   2. Execute: npm run start:dev');
  console.log('   3. Acesse: http://localhost:3001');
  console.log('   4. WebSocket disponível em: ws://localhost:3001/chat');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
