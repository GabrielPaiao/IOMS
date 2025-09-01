const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addCarlosUser() {
  try {
    console.log('🔐 Adicionando usuário Carlos com email desejado...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Listar todas as empresas primeiro
    const companies = await prisma.company.findMany();
    console.log('🏢 Empresas encontradas:', companies.map(c => c.name));
    
    // Buscar a primeira empresa
    const company = companies[0];

    if (!company) {
      console.error('❌ Nenhuma empresa encontrada!');
      return;
    }

    console.log('🏢 Usando empresa:', company.name);

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'carlos.key@techcorp.com' }
    });

    if (existingUser) {
      console.log('✅ Usuário já existe:', existingUser.firstName, existingUser.lastName);
      return;
    }

    // Criar o usuário
    const carlosUser = await prisma.user.create({
      data: {
        email: 'carlos.key@techcorp.com',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'Silva',
        role: 'KEY_USER',
        companyId: company.id,
        location: 'São Paulo, SP'
      }
    });

    console.log('✅ Usuário criado:', carlosUser.firstName, carlosUser.lastName);

    // Buscar as aplicações para associar
    const apps = await prisma.application.findMany({
      where: { companyId: company.id }
    });

    console.log('📱 Aplicações encontradas:', apps.map(a => a.name));

    // Associar com app1 e app3 (mesmo que o Carlos original)
    if (apps.length >= 3) {
      await prisma.applicationKeyUser.createMany({
        data: [
          { applicationId: apps[0].id, userId: carlosUser.id }, // E-commerce Platform
          { applicationId: apps[2].id, userId: carlosUser.id }  // Mobile Banking App
        ]
      });
      console.log('✅ Usuário associado às aplicações:', apps[0].name, 'e', apps[2].name);
    }

    console.log('🎉 Carlos adicionado com sucesso!');
    console.log('📧 Email: carlos.key@techcorp.com');
    console.log('🔑 Senha: 123456');

  } catch (error) {
    console.error('❌ Erro ao adicionar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCarlosUser();
