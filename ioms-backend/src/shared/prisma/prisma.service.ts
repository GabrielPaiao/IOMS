// src/shared/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ExtendedPrismaClient } from './prisma-client-extension';

@Injectable()
export class PrismaService 
  extends ExtendedPrismaClient
  implements OnModuleInit, OnModuleDestroy 
{
  constructor(private readonly configService: ConfigService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Log queries in development
    if (this.configService.get('NODE_ENV') !== 'production') {
      (this as any).$on('query', (e: any) => {
        console.log(`Query: ${e.query}`);
        console.log(`Params: ${e.params}`);
        console.log(`Duration: ${e.duration}ms`);
      });
    }

    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }

  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Prisma.dmmf.datamodel.models
      .map((model) => model.name.toLowerCase())
      .filter((model) => !['invitation'].includes(model));

    return Promise.all(
      models.map((modelName) => {
        const model = this[modelName as keyof this] as any;
        return model.deleteMany();
      })
    );
  }

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
