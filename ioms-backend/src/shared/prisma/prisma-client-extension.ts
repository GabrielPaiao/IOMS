// src/shared/prisma/prisma-client-extension.ts
import { PrismaClient, Prisma } from '@prisma/client';

class ExtendedPrismaClient extends PrismaClient {
  /**
   * Limpa o banco de dados (apenas para desenvolvimento)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const modelNames = Prisma.dmmf.datamodel.models
      .map((model) => model.name.toLowerCase())
      .filter((model) => !['invitation'].includes(model));

    return Promise.all(
      modelNames.map((modelName) => {
        const model = this[modelName as keyof this] as any;
        return model.deleteMany();
      })
    );
  }

  /**
   * Busca usuário com aplicações relacionadas
   */
  async findUserWithApplications(userId: string) {
    return this.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        applications: {
          select: { id: true, name: true, description: true }
        }
      },
    });
  }

  /**
   * Busca outages com detalhes
   */
  async findOutagesWithDetails(companyId?: string) {
    const where: Prisma.OutageWhereInput = {};
    
    if (companyId) {
      where.application = { companyId };
    }

    return this.outage.findMany({
      where,
      include: {
        application: {
          select: { id: true, name: true, description: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

const prisma = new ExtendedPrismaClient();
export { ExtendedPrismaClient, prisma };