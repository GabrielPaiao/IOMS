const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTestData() {
  console.log('🧹 Limpando dados de teste...');

  try {
    // Lista de títulos que identificam os dados de teste
    const testTitles = [
      'Manutenção Sistema de Login',
      'Falha no Banco de Dados',
      'Atualização de API',
      'Migração de Servidor',
      'Correção de Bug Crítico',
      'Backup Mensal',
      'Teste de Performance',
      'Upgrade de Sistema',
      'Falha de Rede',
      'Manutenção de Rotina',
      'Patch de Segurança',
      'Migração Antiga',
      'Sistema Legado'
    ];

    console.log('🔍 Buscando outages de teste...');
    
    const testOutages = await prisma.outage.findMany({
      where: {
        title: {
          in: testTitles
        }
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    if (testOutages.length === 0) {
      console.log('ℹ️  Nenhum dado de teste encontrado para limpar.');
      return;
    }

    console.log(`📋 Encontrados ${testOutages.length} outages de teste:`);
    testOutages.forEach(outage => {
      console.log(`   - ${outage.title} (${outage.createdAt.toLocaleDateString()})`);
    });

    console.log('🗑️  Removendo outages de teste...');
    
    const deleteResult = await prisma.outage.deleteMany({
      where: {
        title: {
          in: testTitles
        }
      }
    });

    console.log(`✅ Removidos ${deleteResult.count} outages de teste.`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearTestData()
  .then(() => {
    console.log('🎉 Limpeza finalizada com sucesso!');
  })
  .catch((e) => {
    console.error('💥 Falha na limpeza:', e);
    process.exit(1);
  });
