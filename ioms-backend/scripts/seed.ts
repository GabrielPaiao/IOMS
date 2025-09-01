import { PrismaClient, UserRole, CriticalityLevel, OutageStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  console.log('🧹 Limpando dados existentes...');
  await prisma.messageRead.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.outageHistory.deleteMany();
  await prisma.outageEnvironment.deleteMany();
  await prisma.workflowStep.deleteMany();
  await prisma.approvalWorkflow.deleteMany();
  await prisma.outage.deleteMany();
  await prisma.applicationKeyUser.deleteMany();
  await prisma.applicationLocation.deleteMany();
  await prisma.applicationEnvironment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // 1. Criar empresas
  console.log('🏢 Criando empresas...');
  const company1 = await prisma.company.create({
    data: {
      name: 'Tech Solutions Ltd',
      description: 'Empresa de desenvolvimento de software e soluções tecnológicas',
      domain: 'techsolutions.com'
    }
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Digital Innovations Corp',
      description: 'Corporação focada em inovações digitais e transformação digital',
      domain: 'digitalinnovations.com'
    }
  });

  // 2. Criar usuários
  console.log('👥 Criando usuários...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@techsolutions.com',
      password: hashedPassword,
      firstName: 'João',
      lastName: 'Silva',
      role: UserRole.ADMIN,
      companyId: company1.id,
      location: 'São Paulo, SP'
    }
  });

  const keyUser1 = await prisma.user.create({
    data: {
      email: 'maria.santos@techsolutions.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      role: UserRole.KEY_USER,
      companyId: company1.id,
      location: 'Rio de Janeiro, RJ'
    }
  });

  const keyUser2 = await prisma.user.create({
    data: {
      email: 'carlos.oliveira@techsolutions.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Oliveira',
      role: UserRole.KEY_USER,
      companyId: company1.id,
      location: 'Belo Horizonte, MG'
    }
  });

  const dev1 = await prisma.user.create({
    data: {
      email: 'ana.costa@techsolutions.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Costa',
      role: UserRole.DEV,
      companyId: company1.id,
      location: 'São Paulo, SP'
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin@digitalinnovations.com',
      password: hashedPassword,
      firstName: 'Roberto',
      lastName: 'Pereira',
      role: UserRole.ADMIN,
      companyId: company2.id,
      location: 'Brasília, DF'
    }
  });

  const keyUser3 = await prisma.user.create({
    data: {
      email: 'lucia.ferreira@digitalinnovations.com',
      password: hashedPassword,
      firstName: 'Lúcia',
      lastName: 'Ferreira',
      role: UserRole.KEY_USER,
      companyId: company2.id,
      location: 'Porto Alegre, RS'
    }
  });

  // 3. Criar aplicações
  console.log('🚀 Criando aplicações...');
  
  // Aplicações da Tech Solutions
  const app1 = await prisma.application.create({
    data: {
      name: 'E-commerce Platform',
      description: 'Plataforma de e-commerce completa com sistema de pagamentos e gestão de estoque',
      version: '2.1.4',
      companyId: company1.id,
      createdBy: admin1.id
    }
  });

  const app2 = await prisma.application.create({
    data: {
      name: 'CRM System',
      description: 'Sistema de gestão de relacionamento com cliente integrado com WhatsApp e Email',
      version: '1.8.2',
      companyId: company1.id,
      createdBy: admin1.id
    }
  });

  const app3 = await prisma.application.create({
    data: {
      name: 'Mobile Banking App',
      description: 'Aplicativo móvel para operações bancárias com biometria e PIX',
      version: '3.2.1',
      companyId: company1.id,
      createdBy: keyUser1.id
    }
  });

  // Aplicações da Digital Innovations
  const app4 = await prisma.application.create({
    data: {
      name: 'IoT Dashboard',
      description: 'Dashboard para monitoramento de dispositivos IoT em tempo real',
      version: '1.5.0',
      companyId: company2.id,
      createdBy: admin2.id
    }
  });

  const app5 = await prisma.application.create({
    data: {
      name: 'AI Analytics Platform',
      description: 'Plataforma de análise de dados com inteligência artificial e machine learning',
      version: '2.0.0',
      companyId: company2.id,
      createdBy: keyUser3.id
    }
  });

  // 4. Criar ambientes das aplicações
  console.log('🌍 Criando ambientes...');
  
  // Ambientes para E-commerce Platform
  await prisma.applicationEnvironment.createMany({
    data: [
      { applicationId: app1.id, environment: 'Desenvolvimento' },
      { applicationId: app1.id, environment: 'Homologação' },
      { applicationId: app1.id, environment: 'Produção' },
      { applicationId: app1.id, environment: 'Staging' }
    ]
  });

  // Ambientes para CRM System
  await prisma.applicationEnvironment.createMany({
    data: [
      { applicationId: app2.id, environment: 'DEV' },
      { applicationId: app2.id, environment: 'QA' },
      { applicationId: app2.id, environment: 'PROD' }
    ]
  });

  // Ambientes para Mobile Banking App
  await prisma.applicationEnvironment.createMany({
    data: [
      { applicationId: app3.id, environment: 'Desenvolvimento' },
      { applicationId: app3.id, environment: 'Teste' },
      { applicationId: app3.id, environment: 'Pré-produção' },
      { applicationId: app3.id, environment: 'Produção' }
    ]
  });

  // Ambientes para IoT Dashboard
  await prisma.applicationEnvironment.createMany({
    data: [
      { applicationId: app4.id, environment: 'Development' },
      { applicationId: app4.id, environment: 'Testing' },
      { applicationId: app4.id, environment: 'Production' }
    ]
  });

  // Ambientes para AI Analytics Platform
  await prisma.applicationEnvironment.createMany({
    data: [
      { applicationId: app5.id, environment: 'Lab' },
      { applicationId: app5.id, environment: 'Staging' },
      { applicationId: app5.id, environment: 'Production' }
    ]
  });

  // 5. Criar localizações das aplicações
  console.log('📍 Criando localizações...');
  
  // Localizações para E-commerce Platform
  const location1 = await prisma.applicationLocation.create({
    data: {
      applicationId: app1.id,
      code: 'SP-DC1',
      name: 'Data Center São Paulo 1'
    }
  });

  const location2 = await prisma.applicationLocation.create({
    data: {
      applicationId: app1.id,
      code: 'RJ-DC1',
      name: 'Data Center Rio de Janeiro'
    }
  });

  // Localizações para CRM System
  const location3 = await prisma.applicationLocation.create({
    data: {
      applicationId: app2.id,
      code: 'AWS-US-EAST',
      name: 'AWS US East (Virginia)'
    }
  });

  // Localizações para Mobile Banking App
  const location4 = await prisma.applicationLocation.create({
    data: {
      applicationId: app3.id,
      code: 'AZURE-BR-SOUTH',
      name: 'Azure Brazil South'
    }
  });

  // Localizações para IoT Dashboard
  const location5 = await prisma.applicationLocation.create({
    data: {
      applicationId: app4.id,
      code: 'GCP-SA-EAST',
      name: 'Google Cloud Platform South America East'
    }
  });

  // Localizações para AI Analytics Platform
  const location6 = await prisma.applicationLocation.create({
    data: {
      applicationId: app5.id,
      code: 'HYBRID-CLOUD',
      name: 'Hybrid Cloud Infrastructure'
    }
  });

  // 6. Criar key users das aplicações
  console.log('🔑 Criando key users...');
  
  // Key users para E-commerce Platform
  await prisma.applicationKeyUser.createMany({
    data: [
      { applicationId: app1.id, userId: keyUser1.id },
      { applicationId: app1.id, userId: keyUser2.id }
    ]
  });

  // Key users para CRM System
  await prisma.applicationKeyUser.create({
    data: { applicationId: app2.id, userId: keyUser1.id }
  });

  // Key users para Mobile Banking App
  await prisma.applicationKeyUser.createMany({
    data: [
      { applicationId: app3.id, userId: keyUser1.id },
      { applicationId: app3.id, userId: keyUser2.id }
    ]
  });

  // Key users para IoT Dashboard
  await prisma.applicationKeyUser.create({
    data: { applicationId: app4.id, userId: keyUser3.id }
  });

  // Key users para AI Analytics Platform
  await prisma.applicationKeyUser.create({
    data: { applicationId: app5.id, userId: keyUser3.id }
  });

  // 7. Criar algumas outages de exemplo
  console.log('⚠️ Criando outages...');
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Outage concluída
  const outage1 = await prisma.outage.create({
    data: {
      applicationId: app1.id,
      companyId: company1.id,
      createdBy: keyUser1.id,
      title: 'Manutenção programada do banco de dados',
      reason: 'Atualização da versão do PostgreSQL para correção de vulnerabilidades',
      description: 'Atualização do PostgreSQL da versão 14.2 para 14.8 incluindo patches de segurança',
      scheduledStart: twoHoursAgo,
      scheduledEnd: oneHourAgo,
      start: twoHoursAgo,
      end: oneHourAgo,
      criticality: CriticalityLevel.MEDIUM,
      planned: true,
      estimatedDuration: 3600, // 1 hora
      status: OutageStatus.COMPLETED,
      approvedBy: admin1.id,
      approvedAt: new Date(twoHoursAgo.getTime() - 30 * 60 * 1000),
      locationId: location1.id
    }
  });

  // Outage aprovada para amanhã
  const outage2 = await prisma.outage.create({
    data: {
      applicationId: app2.id,
      companyId: company1.id,
      createdBy: keyUser1.id,
      title: 'Deploy da versão 1.9.0',
      reason: 'Nova funcionalidade de integração com WhatsApp Business API',
      description: 'Deploy incluindo nova integração com WhatsApp, melhorias de performance e correções de bugs',
      scheduledStart: tomorrow,
      scheduledEnd: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 horas
      start: tomorrow,
      end: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      criticality: CriticalityLevel.HIGH,
      planned: true,
      estimatedDuration: 7200, // 2 horas
      status: OutageStatus.APPROVED,
      approvedBy: admin1.id,
      approvedAt: new Date(),
      locationId: location3.id
    }
  });

  // Outage pendente
  const outage3 = await prisma.outage.create({
    data: {
      applicationId: app3.id,
      companyId: company1.id,
      createdBy: keyUser2.id,
      title: 'Migração de infraestrutura',
      reason: 'Migração dos serviços para nova região da Azure',
      description: 'Migração completa da aplicação mobile banking para Azure Brazil South para reduzir latência',
      scheduledStart: nextWeek,
      scheduledEnd: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000), // 4 horas
      start: nextWeek,
      end: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000),
      criticality: CriticalityLevel.CRITICAL,
      planned: true,
      estimatedDuration: 14400, // 4 horas
      status: OutageStatus.PENDING,
      locationId: location4.id
    }
  });

  // Outage da company2
  const outage4 = await prisma.outage.create({
    data: {
      applicationId: app4.id,
      companyId: company2.id,
      createdBy: keyUser3.id,
      title: 'Atualização do sistema de monitoramento',
      reason: 'Implementação de novos sensores e dashboards',
      description: 'Atualização do sistema para suportar 1000+ dispositivos IoT simultâneos',
      scheduledStart: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias
      scheduledEnd: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 horas
      start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      end: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      criticality: CriticalityLevel.MEDIUM,
      planned: true,
      estimatedDuration: 10800, // 3 horas
      status: OutageStatus.APPROVED,
      approvedBy: admin2.id,
      approvedAt: new Date(),
      locationId: location5.id
    }
  });

  // 8. Criar ambientes das outages
  console.log('🌍 Criando ambientes das outages...');
  
  await prisma.outageEnvironment.createMany({
    data: [
      { outageId: outage1.id, environment: 'Produção' },
      { outageId: outage2.id, environment: 'PROD' },
      { outageId: outage3.id, environment: 'Produção' },
      { outageId: outage3.id, environment: 'Pré-produção' },
      { outageId: outage4.id, environment: 'Production' }
    ]
  });

  console.log('✅ Seeding completado com sucesso!');
  
  // Resumo dos dados criados
  console.log('\n📊 Resumo dos dados criados:');
  console.log(`📊 Empresas: 2`);
  console.log(`👥 Usuários: 6`);
  console.log(`🚀 Aplicações: 5`);
  console.log(`🌍 Ambientes: 18`);
  console.log(`📍 Localizações: 6`);
  console.log(`🔑 Relações Key User: 7`);
  console.log(`⚠️ Outages: 4`);
  console.log(`🌍 Ambientes de Outage: 5`);
  
  console.log('\n🔐 Credenciais de acesso:');
  console.log('📧 Email: admin@techsolutions.com | 🔑 Senha: 123456 (ADMIN)');
  console.log('📧 Email: maria.santos@techsolutions.com | 🔑 Senha: 123456 (KEY_USER)');
  console.log('📧 Email: carlos.oliveira@techsolutions.com | 🔑 Senha: 123456 (KEY_USER)');
  console.log('📧 Email: ana.costa@techsolutions.com | 🔑 Senha: 123456 (DEV)');
  console.log('📧 Email: admin@digitalinnovations.com | 🔑 Senha: 123456 (ADMIN)');
  console.log('📧 Email: lucia.ferreira@digitalinnovations.com | 🔑 Senha: 123456 (KEY_USER)');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
