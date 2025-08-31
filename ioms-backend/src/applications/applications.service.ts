import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, userId: string) {
    const { environments, locations, keyUsers, ...data } = createApplicationDto;

    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Converter emails para IDs de usuário (se keyUsers for fornecido)
    let keyUserIds: string[] = [];
    if (keyUsers && keyUsers.length > 0) {
      for (const keyUser of keyUsers) {
        // Se contém @, é um email, senão é um ID
        if (keyUser.includes('@')) {
          const user = await this.prisma.user.findUnique({
            where: { email: keyUser },
          });
          if (user) {
            keyUserIds.push(user.id);
          }
        } else {
          keyUserIds.push(keyUser);
        }
      }
    }

    // Criar aplicação com ambientes, localizações
    const application = await this.prisma.application.create({
      data: {
        ...data,
        createdBy: userId,
        environments: {
          create: environments.map(env => ({ environment: env })),
        },
        locations: {
          create: locations.map(loc => ({ code: loc, name: loc })),
        },
      },
    });

    // Adicionar key users separadamente se fornecidos
    if (keyUserIds.length > 0) {
      for (const keyUserId of keyUserIds) {
        await this.prisma.$queryRaw`
          INSERT INTO application_key_users (id, "applicationId", "userId") 
          VALUES (gen_random_uuid(), ${application.id}, ${keyUserId})
        `;
      }
    }

    // Retornar aplicação com todos os relacionamentos
    const fullApplication = await this.prisma.application.findUnique({
      where: { id: application.id },
      include: {
        environments: true,
        locations: true,
        company: true,
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Buscar key users separadamente
    const keyUsersData = await this.prisma.$queryRaw`
      SELECT 
        aku.id as keyuser_id,
        u.id as user_id, 
        u."firstName" as first_name, 
        u."lastName" as last_name, 
        u.email 
      FROM application_key_users aku
      INNER JOIN users u ON aku."userId" = u.id
      WHERE aku."applicationId" = ${application.id}
    `;

    return {
      ...fullApplication,
      keyUsers: keyUsersData as any[]
    };
  }

  async findAll(companyId?: string, filters?: any) {
    const where: any = {};
    
    if (companyId) {
      where.companyId = companyId;
    }

    if (filters?.environment) {
      where.environments = {
        some: { environment: filters.environment },
      };
    }

    if (filters?.location) {
      where.locations = {
        some: { code: { contains: filters.location, mode: 'insensitive' } },
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.application.findMany({
      where,
      include: {
        environments: true,
        locations: true,
        company: {
          select: { id: true, name: true },
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { outages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        environments: true,
        locations: true,
        company: {
          select: { id: true, name: true },
        },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        outages: {
          include: {
            createdByUser: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { outages: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Buscar key users separadamente
    const keyUsersData = await this.prisma.$queryRaw`
      SELECT 
        aku.id as keyuser_id,
        u.id as user_id, 
        u."firstName" as first_name, 
        u."lastName" as last_name, 
        u.email 
      FROM application_key_users aku
      INNER JOIN users u ON aku."userId" = u.id
      WHERE aku."applicationId" = ${id}
    `;

    return {
      ...application,
      keyUsers: keyUsersData as any[]
    };
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, userId: string) {
    const application = await this.findOne(id);
    const { environments, locations, keyUsers, ...data } = updateApplicationDto;

    // Atualizar aplicação
    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        environments: true,
        locations: true,
        company: true,
        updatedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Atualizar ambientes se fornecidos
    if (environments) {
      // Remover ambientes existentes
      await this.prisma.applicationEnvironment.deleteMany({
        where: { applicationId: id },
      });

      // Criar novos ambientes
      await this.prisma.applicationEnvironment.createMany({
        data: environments.map(env => ({
          applicationId: id,
          environment: env,
        })),
      });
    }

    // Atualizar localizações se fornecidas
    if (locations) {
      // Remover localizações existentes
      await this.prisma.applicationLocation.deleteMany({
        where: { applicationId: id },
      });

      // Criar novas localizações
      await this.prisma.applicationLocation.createMany({
        data: locations.map(loc => ({
          applicationId: id,
          code: loc,
          name: loc,
        })),
      });
    }

    // Atualizar key users se fornecidos
    if (keyUsers !== undefined) {
      // Remover key users existentes
      await this.prisma.$queryRaw`DELETE FROM application_key_users WHERE "applicationId" = ${id}`;

      // Converter emails para IDs de usuário se necessário
      let keyUserIds: string[] = [];
      if (keyUsers.length > 0) {
        for (const keyUser of keyUsers) {
          // Se contém @, é um email, senão é um ID
          if (keyUser.includes('@')) {
            const user = await this.prisma.user.findUnique({
              where: { email: keyUser },
            });
            if (user) {
              keyUserIds.push(user.id);
            }
          } else {
            keyUserIds.push(keyUser);
          }
        }
      }

      // Criar novos key users usando raw SQL se necessário
      if (keyUserIds.length > 0) {
        for (const userId of keyUserIds) {
          await this.prisma.$queryRaw`
            INSERT INTO application_key_users (id, "applicationId", "userId") 
            VALUES (gen_random_uuid(), ${id}, ${userId})
          `;
        }
      }
    }

    // Retornar aplicação atualizada
    return this.findOne(id);
  }

  async remove(id: string) {
    const application = await this.findOne(id);

    // Verificar se há outages associadas
    const outageCount = await this.prisma.outage.count({
      where: { applicationId: id },
    });

    if (outageCount > 0) {
      throw new BadRequestException(
        `Cannot delete application with ${outageCount} associated outages`,
      );
    }

    // Remover ambientes e localizações
    await this.prisma.applicationEnvironment.deleteMany({
      where: { applicationId: id },
    });

    await this.prisma.applicationLocation.deleteMany({
      where: { applicationId: id },
    });

    // Remover key users
    await this.prisma.$queryRaw`DELETE FROM application_key_users WHERE "applicationId" = ${id}`;

    // Remover aplicação
    await this.prisma.application.delete({
      where: { id },
    });

    return { message: 'Application deleted successfully' };
  }

  async getApplicationStats(id: string) {
    const application = await this.findOne(id);

    const stats = await this.prisma.outage.groupBy({
      by: ['status'],
      where: { applicationId: id },
      _count: { status: true },
    });

    const totalOutages = await this.prisma.outage.count({
      where: { applicationId: id },
    });

    const criticalOutages = await this.prisma.outage.count({
      where: {
        applicationId: id,
        criticality: 'CRITICAL',
      },
    });

    const monthlyOutages = await this.prisma.outage.groupBy({
      by: ['createdAt'],
      where: {
        applicationId: id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _count: { id: true },
    });

    return {
      application,
      stats: {
        total: totalOutages,
        critical: criticalOutages,
        byStatus: stats,
        monthly: monthlyOutages,
      },
    };
  }

  async getApplicationsByCompany(companyId: string) {
    return this.prisma.application.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        description: true,
        environments: true,
        locations: true,
        _count: {
          select: { outages: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
