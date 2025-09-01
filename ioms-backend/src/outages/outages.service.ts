// src/outages/outages.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateOutageDto } from './dto/create-outage.dto';

@Injectable()
export class OutagesService {
  constructor(private prisma: PrismaService) {}

  async create(createOutageDto: CreateOutageDto, userId: string) {
    const { applicationId } = createOutageDto;

    // Verificar se a aplicação existe
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    // Verificar se o usuário é Key User e se há outros Key Users para a aplicação
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role === 'KEY_USER') {
      // Verificar se o usuário é Key User da aplicação
      const isKeyUserForApp = await this.prisma.applicationKeyUser.findFirst({
        where: {
          userId,
          applicationId: applicationId
        }
      });

      if (isKeyUserForApp) {
        // Contar quantos Key Users existem para esta aplicação
        const keyUsersCount = await this.prisma.applicationKeyUser.count({
          where: {
            applicationId: applicationId
          }
        });

        if (keyUsersCount === 1) {
          throw new ForbiddenException('You cannot create outage requests for applications where you are the only Key User. At least one other Key User is required for approval.');
        }
      }
    }

    // Criar outage
    const outage = await this.prisma.outage.create({
      data: {
        title: createOutageDto.title,
        reason: createOutageDto.title, // Map title to reason
        description: createOutageDto.description,
        criticality: createOutageDto.criticality,
        applicationId: createOutageDto.applicationId,
        locationId: createOutageDto.locationId,
        start: createOutageDto.start,
        end: createOutageDto.end,
        scheduledStart: createOutageDto.start, // Map start to scheduledStart
        scheduledEnd: createOutageDto.end, // Map end to scheduledEnd
        planned: createOutageDto.planned || false,
        estimatedDuration: Math.ceil((new Date(createOutageDto.end).getTime() - new Date(createOutageDto.start).getTime()) / 1000), // Duration in seconds
        companyId: application.companyId,
        createdBy: userId,
        status: 'PENDING',
      },
      include: {
        application: true,
        company: true,
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        approvalWorkflows: {
          include: {
            steps: true
          }
        }
      },
    });

    return outage;
  }

  async findAll(companyId: string, filters?: any) {
    const where: any = { companyId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.criticality) {
      where.criticality = filters.criticality;
    }

    if (filters?.applicationId) {
      where.applicationId = filters.applicationId;
    }

    if (filters?.environment) {
      where.application = {
        environments: {
          some: { environment: filters.environment },
        },
      };
    }

    if (filters?.location) {
      where.application = {
        locations: {
          some: { code: { contains: filters.location, mode: 'insensitive' } },
        },
      };
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledStart = {};
      if (filters.startDate) where.scheduledStart.gte = new Date(filters.startDate);
      if (filters.endDate) where.scheduledStart.lte = new Date(filters.endDate);
    }

    if (filters?.search) {
      where.OR = [
        { reason: { contains: filters.search, mode: 'insensitive' } },
        { application: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.outage.findMany({
      where,
      include: {
        application: {
          select: { id: true, name: true, environments: true, locations: true },
        },
        company: { select: { id: true, name: true } },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        approvalWorkflows: {
          include: {
            steps: {
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const outage = await this.prisma.outage.findUnique({
      where: { id },
      include: {
        application: {
          select: { id: true, name: true, environments: true, locations: true },
        },
        company: { select: { id: true, name: true } },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        approvalWorkflows: {
          include: {
            steps: {
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
        history: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!outage) {
      throw new NotFoundException('Outage not found');
    }

    return outage;
  }

  async findByUser(userId: string) {
    return this.prisma.outage.findMany({
      where: { createdBy: userId },
      include: {
        application: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        approvalWorkflows: {
          include: {
            steps: {
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingApproval(companyId: string) {
    return this.prisma.outage.findMany({
      where: {
        companyId,
        status: 'PENDING',
      },
      include: {
        application: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        approvalWorkflows: {
          include: {
            steps: {
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findPendingApprovalForUser(userId: string, companyId: string) {
    try {
      // Buscar as aplicações que o Key User gerencia
      const userApplications = await this.prisma.applicationKeyUser.findMany({
        where: { userId },
        select: { applicationId: true },
      });

      const applicationIds = userApplications.map(app => app.applicationId);

      if (applicationIds.length === 0) {
        return []; // Se não gerencia nenhuma aplicação, não pode aprovar nada
      }

      const result = await this.prisma.outage.findMany({
        where: {
          companyId,
          status: 'PENDING',
          applicationId: { in: applicationIds },
        },
        include: {
          application: { 
            select: { id: true, name: true },
          },
          company: { select: { id: true, name: true } },
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          approvalWorkflows: {
            include: {
              steps: {
                include: {
                  assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return result;
    } catch (error) {
      console.error('Erro em findPendingApprovalForUser:', error);
      throw error;
    }
  }

  async getCalendar(companyId: string, filters?: any) {
    const where: any = { companyId };

    if (filters?.startDate || filters?.endDate) {
      where.scheduledStart = {};
      if (filters.startDate) where.scheduledStart.gte = new Date(filters.startDate);
      if (filters.endDate) where.scheduledStart.lte = new Date(filters.endDate);
    }

    return this.prisma.outage.findMany({
      where,
      select: {
        id: true,
        scheduledStart: true,
        scheduledEnd: true,
        status: true,
        criticality: true,
        reason: true,
        application: { select: { name: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledStart: 'asc' },
    });
  }

  async checkConflicts(companyId: string, filters?: any) {
    const where: any = { companyId };

    if (filters?.startDate || filters?.endDate) {
      where.scheduledStart = {};
      if (filters.startDate) where.scheduledStart.gte = new Date(filters.startDate);
      if (filters.endDate) where.scheduledStart.lte = new Date(filters.endDate);
    }

    const outages = await this.prisma.outage.findMany({
      where,
      include: {
        application: { select: { id: true, name: true } },
      },
      orderBy: { scheduledStart: 'asc' },
    });

    // Implementar lógica de detecção de conflitos
    const conflicts: any[] = [];
    for (let i = 0; i < outages.length; i++) {
      for (let j = i + 1; j < outages.length; j++) {
        const outage1 = outages[i];
        const outage2 = outages[j];

        // Verificar sobreposição de horários
        if (
          outage1.scheduledStart < outage2.scheduledEnd &&
          outage1.scheduledEnd > outage2.scheduledStart
        ) {
          conflicts.push({
            type: 'time_overlap',
            severity: 'high',
            outages: [outage1, outage2],
            message: `Time overlap between outages: ${outage1.reason} and ${outage2.reason}`,
          });
        }

        // Verificar conflitos de aplicação
        if (outage1.applicationId === outage2.applicationId) {
          conflicts.push({
            type: 'application_conflict',
            severity: 'critical',
            outages: [outage1, outage2],
            message: `Multiple outages for same application: ${outage1.application.name}`,
          });
        }
      }
    }

    return conflicts;
  }

  async getHistory(id: string) {
    const history = await this.prisma.outageHistory.findMany({
      where: { outageId: id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return history;
  }

  async update(id: string, updateOutageDto: any, userId: string) {
    const outage = await this.findOne(id);

    // Verificar permissões
    if (outage.createdBy !== userId && outage.status !== 'PENDING') {
      throw new BadRequestException('Cannot update approved/rejected outage');
    }

    const updatedOutage = await this.prisma.outage.update({
      where: { id },
      data: {
        ...updateOutageDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        application: true,
        company: true,
        updatedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Registrar mudança no histórico
    await this.prisma.outageHistory.create({
      data: {
        outageId: id,
        userId,
        field: 'general',
        oldValue: JSON.stringify(outage),
        newValue: JSON.stringify(updatedOutage),
        action: 'UPDATE',
        reason: 'Outage updated',
      },
    });

    return updatedOutage;
  }

  async approveOutage(id: string, userId: string, approvalData: any) {
    const outage = await this.findOne(id);

    if (outage.status !== 'PENDING') {
      throw new BadRequestException('Outage is not pending approval');
    }

    // Verificar se o usuário não é o criador da outage
    if (outage.createdBy === userId) {
      throw new ForbiddenException('You cannot approve your own outage request');
    }

    // Verificar se o usuário é Key User da aplicação
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role === 'KEY_USER') {
      const isKeyUserForApp = await this.prisma.applicationKeyUser.findFirst({
        where: {
          userId,
          applicationId: outage.applicationId
        }
      });

      if (!isKeyUserForApp) {
        throw new ForbiddenException('You can only approve outages for applications you manage');
      }
    }

    // Atualizar status
    const updatedOutage = await this.prisma.outage.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    // Registrar mudança no histórico
    await this.prisma.outageHistory.create({
      data: {
        outageId: id,
        userId,
        field: 'status',
        oldValue: 'PENDING',
        newValue: 'APPROVED',
        action: 'STATUS_CHANGE',
        reason: approvalData.reason || 'Outage approved',
      },
    });

    return updatedOutage;
  }

  async rejectOutage(id: string, userId: string, rejectionData: any) {
    const outage = await this.findOne(id);

    if (outage.status !== 'PENDING') {
      throw new BadRequestException('Outage is not pending approval');
    }

    // Verificar se o usuário é Key User da aplicação
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role === 'KEY_USER') {
      const isKeyUserForApp = await this.prisma.applicationKeyUser.findFirst({
        where: {
          userId,
          applicationId: outage.applicationId
        }
      });

      if (!isKeyUserForApp) {
        throw new ForbiddenException('You can only reject outages for applications you manage');
      }
    }

    // Atualizar status
    const updatedOutage = await this.prisma.outage.update({
      where: { id },
      data: {
        status: 'REJECTED',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    // Registrar mudança no histórico
    await this.prisma.outageHistory.create({
      data: {
        outageId: id,
        userId,
        field: 'status',
        oldValue: 'PENDING',
        newValue: 'REJECTED',
        action: 'STATUS_CHANGE',
        reason: rejectionData.reason || 'Outage rejected',
      },
    });

    return updatedOutage;
  }

  async cancelOutage(id: string, userId: string, cancellationData: any) {
    const outage = await this.findOne(id);

    // Verificar se a outage pode ser cancelada
    if (outage.status === 'CANCELLED') {
      throw new BadRequestException('Outage is already cancelled');
    }
    
    if (outage.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed outage');
    }

    // Atualizar status
    const updatedOutage = await this.prisma.outage.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    // Registrar mudança no histórico
    await this.prisma.outageHistory.create({
      data: {
        outageId: id,
        userId,
        field: 'status',
        oldValue: outage.status,
        newValue: 'CANCELLED',
        action: 'STATUS_CHANGE',
        reason: cancellationData.reason || 'Outage cancelled',
      },
    });

    return updatedOutage;
  }

  async remove(id: string) {
    const outage = await this.findOne(id);

    if (outage.status !== 'PENDING') {
      throw new BadRequestException('Cannot delete approved/rejected outage');
    }

    await this.prisma.outage.delete({
      where: { id },
    });

    return { message: 'Outage deleted successfully' };
  }

  async getStatsSummary(companyId: string) {
    const [
      totalOutages,
      pendingOutages,
      approvedOutages,
      rejectedOutages,
      cancelledOutages,
    ] = await Promise.all([
      this.prisma.outage.count({ where: { companyId } }),
      this.prisma.outage.count({ where: { companyId, status: 'PENDING' } }),
      this.prisma.outage.count({ where: { companyId, status: 'APPROVED' } }),
      this.prisma.outage.count({ where: { companyId, status: 'REJECTED' } }),
      this.prisma.outage.count({ where: { companyId, status: 'CANCELLED' } }),
    ]);

    return {
      total: totalOutages,
      pending: pendingOutages,
      approved: approvedOutages,
      rejected: rejectedOutages,
      cancelled: cancelledOutages,
      approvalRate: totalOutages > 0 ? (approvedOutages / totalOutages) * 100 : 0,
    };
  }

  async getStatsByApplication(companyId: string) {
    return this.prisma.outage.groupBy({
      by: ['applicationId'],
      where: { companyId },
      _count: { id: true },
      _sum: { estimatedDuration: true },
    });
  }

  async getStatsByCriticality(companyId: string) {
    return this.prisma.outage.groupBy({
      by: ['criticality'],
      where: { companyId },
      _count: { id: true },
    });
  }

  async getStatsByStatus(companyId: string) {
    return this.prisma.outage.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { id: true },
    });
  }
}