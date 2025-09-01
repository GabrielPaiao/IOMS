const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Iniciando seed de dados de teste...');

  try {
    // Busca dados existentes
    const companies = await prisma.company.findMany();
    const users = await prisma.user.findMany();
    const applications = await prisma.application.findMany();

    if (companies.length === 0 || users.length === 0 || applications.length === 0) {
      console.log('❌ Dados básicos não encontrados. Execute o seed principal primeiro.');
      return;
    }

    const company = companies[0];
    const user = users[0];
    const apps = applications.slice(0, 3); // Usa as 3 primeiras aplicações

    console.log(`🏢 Usando empresa: ${company.name}`);
    console.log(`👤 Usando usuário: ${user.firstName} ${user.lastName}`);
    console.log(`📱 Usando aplicações: ${apps.map(app => app.name).join(', ')}`);

    // Define datas para diferentes períodos
    const now = new Date();
    const dates = {
      // Última semana (2-9 dias atrás)
      week: [
        new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 dias
        new Date(now.getTime() - (4 * 24 * 60 * 60 * 1000)), // 4 dias
        new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000)), // 6 dias
      ],
      // Último mês (10-35 dias atrás)
      month: [
        new Date(now.getTime() - (12 * 24 * 60 * 60 * 1000)), // 12 dias
        new Date(now.getTime() - (18 * 24 * 60 * 60 * 1000)), // 18 dias
        new Date(now.getTime() - (25 * 24 * 60 * 60 * 1000)), // 25 dias
        new Date(now.getTime() - (32 * 24 * 60 * 60 * 1000)), // 32 dias
      ],
      // Último trimestre (40-90 dias atrás)
      quarter: [
        new Date(now.getTime() - (45 * 24 * 60 * 60 * 1000)), // 45 dias
        new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)), // 60 dias
        new Date(now.getTime() - (75 * 24 * 60 * 60 * 1000)), // 75 dias
        new Date(now.getTime() - (85 * 24 * 60 * 60 * 1000)), // 85 dias
      ],
      // Mais antigos (para testar que não aparecem nos filtros)
      old: [
        new Date(now.getTime() - (120 * 24 * 60 * 60 * 1000)), // 120 dias
        new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)), // 180 dias
      ]
    };

    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
    const criticalities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    // Dados de teste para cada período
    const testOutages = [
      // Última semana - 3 outages
      {
        title: 'Manutenção Sistema de Login',
        reason: 'Atualização de segurança',
        description: 'Manutenção programada para correção de vulnerabilidades',
        applicationId: apps[0].id,
        criticality: 'MEDIUM',
        status: 'COMPLETED',
        estimatedDuration: 7200, // 2 horas
        createdAt: dates.week[0],
        scheduledStart: dates.week[0],
        scheduledEnd: new Date(dates.week[0].getTime() + (2 * 60 * 60 * 1000)),
        start: dates.week[0],
        end: new Date(dates.week[0].getTime() + (2 * 60 * 60 * 1000)),
        planned: true
      },
      {
        title: 'Falha no Banco de Dados',
        reason: 'Problema de conectividade',
        description: 'Interrupção não planejada devido a falha de hardware',
        applicationId: apps[1].id,
        criticality: 'HIGH',
        status: 'APPROVED',
        estimatedDuration: 3600, // 1 hora
        createdAt: dates.week[1],
        scheduledStart: dates.week[1],
        scheduledEnd: new Date(dates.week[1].getTime() + (1 * 60 * 60 * 1000)),
        start: dates.week[1],
        end: new Date(dates.week[1].getTime() + (1 * 60 * 60 * 1000)),
        planned: false
      },
      {
        title: 'Atualização de API',
        reason: 'Deploy de nova versão',
        description: 'Implementação de novas funcionalidades',
        applicationId: apps[2].id,
        criticality: 'LOW',
        status: 'PENDING',
        estimatedDuration: 5400, // 1.5 horas
        createdAt: dates.week[2],
        scheduledStart: dates.week[2],
        scheduledEnd: new Date(dates.week[2].getTime() + (1.5 * 60 * 60 * 1000)),
        start: dates.week[2],
        end: new Date(dates.week[2].getTime() + (1.5 * 60 * 60 * 1000)),
        planned: true
      },

      // Último mês - 4 outages
      {
        title: 'Migração de Servidor',
        reason: 'Mudança de infraestrutura',
        description: 'Migração para nova infraestrutura cloud',
        applicationId: apps[0].id,
        criticality: 'CRITICAL',
        status: 'COMPLETED',
        estimatedDuration: 14400, // 4 horas
        createdAt: dates.month[0],
        scheduledStart: dates.month[0],
        scheduledEnd: new Date(dates.month[0].getTime() + (4 * 60 * 60 * 1000)),
        start: dates.month[0],
        end: new Date(dates.month[0].getTime() + (4 * 60 * 60 * 1000)),
        planned: true
      },
      {
        title: 'Correção de Bug Crítico',
        reason: 'Falha de segurança detectada',
        description: 'Correção urgente de vulnerabilidade',
        applicationId: apps[1].id,
        criticality: 'CRITICAL',
        status: 'COMPLETED',
        estimatedDuration: 1800, // 30 minutos
        createdAt: dates.month[1],
        scheduledStart: dates.month[1],
        scheduledEnd: new Date(dates.month[1].getTime() + (0.5 * 60 * 60 * 1000)),
        start: dates.month[1],
        end: new Date(dates.month[1].getTime() + (0.5 * 60 * 60 * 1000)),
        planned: false
      },
      {
        title: 'Backup Mensal',
        reason: 'Backup programado',
        description: 'Backup completo do sistema',
        applicationId: apps[2].id,
        criticality: 'LOW',
        status: 'APPROVED',
        estimatedDuration: 10800, // 3 horas
        createdAt: dates.month[2],
        scheduledStart: dates.month[2],
        scheduledEnd: new Date(dates.month[2].getTime() + (3 * 60 * 60 * 1000)),
        start: dates.month[2],
        end: new Date(dates.month[2].getTime() + (3 * 60 * 60 * 1000)),
        planned: true
      },
      {
        title: 'Teste de Performance',
        reason: 'Análise de carga',
        description: 'Teste de stress no sistema',
        applicationId: apps[0].id,
        criticality: 'MEDIUM',
        status: 'REJECTED',
        estimatedDuration: 7200, // 2 horas
        createdAt: dates.month[3],
        scheduledStart: dates.month[3],
        scheduledEnd: new Date(dates.month[3].getTime() + (2 * 60 * 60 * 1000)),
        start: dates.month[3],
        end: new Date(dates.month[3].getTime() + (2 * 60 * 60 * 1000)),
        planned: true
      },

      // Último trimestre - 4 outages
      {
        title: 'Upgrade de Sistema',
        reason: 'Atualização major',
        description: 'Atualização para nova versão principal',
        applicationId: apps[1].id,
        criticality: 'HIGH',
        status: 'COMPLETED',
        estimatedDuration: 18000, // 5 horas
        createdAt: dates.quarter[0],
        scheduledStart: dates.quarter[0],
        scheduledEnd: new Date(dates.quarter[0].getTime() + (5 * 60 * 60 * 1000)),
        start: dates.quarter[0],
        end: new Date(dates.quarter[0].getTime() + (5 * 60 * 60 * 1000)),
        planned: true
      },
      {
        title: 'Falha de Rede',
        reason: 'Problema de conectividade',
        description: 'Interrupção da conectividade de rede',
        applicationId: apps[2].id,
        criticality: 'HIGH',
        status: 'COMPLETED',
        estimatedDuration: 5400, // 1.5 horas
        createdAt: dates.quarter[1],
        scheduledStart: dates.quarter[1],
        scheduledEnd: new Date(dates.quarter[1].getTime() + (1.5 * 60 * 60 * 1000)),
        start: dates.quarter[1],
        end: new Date(dates.quarter[1].getTime() + (1.5 * 60 * 60 * 1000)),
        planned: false
      },
      {
        title: 'Manutenção de Rotina',
        reason: 'Manutenção preventiva',
        description: 'Manutenção programada trimestral',
        applicationId: apps[0].id,
        criticality: 'MEDIUM',
        status: 'APPROVED',
        estimatedDuration: 9000, // 2.5 horas
        createdAt: dates.quarter[2],
        scheduledStart: dates.quarter[2],
        scheduledEnd: new Date(dates.quarter[2].getTime() + (2.5 * 60 * 60 * 1000)),
        start: dates.quarter[2],
        end: new Date(dates.quarter[2].getTime() + (2.5 * 60 * 60 * 1000)),
        planned: true
      },
      {
        title: 'Patch de Segurança',
        reason: 'Atualização de segurança',
        description: 'Aplicação de patches críticos',
        applicationId: apps[1].id,
        criticality: 'MEDIUM',
        status: 'PENDING',
        estimatedDuration: 3600, // 1 hora
        createdAt: dates.quarter[3],
        scheduledStart: dates.quarter[3],
        scheduledEnd: new Date(dates.quarter[3].getTime() + (1 * 60 * 60 * 1000)),
        start: dates.quarter[3],
        end: new Date(dates.quarter[3].getTime() + (1 * 60 * 60 * 1000)),
        planned: true
      },

      // Dados mais antigos (para controle) - 2 outages
      {
        title: 'Migração Antiga',
        reason: 'Mudança de datacenter',
        description: 'Migração realizada há muito tempo',
        applicationId: apps[2].id,
        criticality: 'LOW',
        status: 'COMPLETED',
        estimatedDuration: 28800, // 8 horas
        createdAt: dates.old[0],
        scheduledStart: dates.old[0],
        scheduledEnd: new Date(dates.old[0].getTime() + (8 * 60 * 60 * 1000)),
        start: dates.old[0],
        end: new Date(dates.old[0].getTime() + (8 * 60 * 60 * 1000)),
        planned: true
      },
      {
        title: 'Sistema Legado',
        reason: 'Descontinuação',
        description: 'Desligamento de sistema antigo',
        applicationId: apps[0].id,
        criticality: 'LOW',
        status: 'COMPLETED',
        estimatedDuration: 3600, // 1 hora
        createdAt: dates.old[1],
        scheduledStart: dates.old[1],
        scheduledEnd: new Date(dates.old[1].getTime() + (1 * 60 * 60 * 1000)),
        start: dates.old[1],
        end: new Date(dates.old[1].getTime() + (1 * 60 * 60 * 1000)),
        planned: true
      }
    ];

    console.log('📝 Criando outages de teste...');

    for (const outageData of testOutages) {
      await prisma.outage.create({
        data: {
          ...outageData,
          companyId: company.id,
          createdBy: user.id,
        }
      });
    }

    console.log('✅ Seed de dados de teste concluído!');
    console.log(`📊 Resumo dos dados criados:`);
    console.log(`   - 3 outages da última semana`);
    console.log(`   - 4 outages do último mês`);
    console.log(`   - 4 outages do último trimestre`);
    console.log(`   - 2 outages mais antigos (controle)`);
    console.log(`   - Total: ${testOutages.length} outages`);
    
    console.log(`\n🎯 Para testar o dashboard:`);
    console.log(`   1. Acesse o dashboard`);
    console.log(`   2. Teste os filtros: "Última Semana", "Último Mês", "Último Trimestre"`);
    console.log(`   3. Verifique se os números mudam conforme o período selecionado`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData()
  .then(() => {
    console.log('🎉 Seed finalizado com sucesso!');
  })
  .catch((e) => {
    console.error('💥 Falha no seed:', e);
    process.exit(1);
  });
