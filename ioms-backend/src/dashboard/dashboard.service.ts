import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(companyId: string, filters: DashboardFiltersDto) {
    const where: any = { companyId };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    if (filters.environment) {
      where.application = {
        environments: {
          some: { environment: filters.environment },
        },
      };
    }

    if (filters.criticality) {
      where.criticality = filters.criticality;
    }

    if (filters.applicationId) {
      where.applicationId = filters.applicationId;
    }

    if (filters.location) {
      where.application = {
        locations: {
          some: { code: { contains: filters.location, mode: 'insensitive' } },
        },
      };
    }

    // Estatísticas gerais
    const [
      totalOutages,
      pendingOutages,
      approvedOutages,
      rejectedOutages,
      criticalOutages,
      highOutages,
      mediumOutages,
      lowOutages,
    ] = await Promise.all([
      this.prisma.outage.count({ where }),
      this.prisma.outage.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.outage.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.outage.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.outage.count({ where: { ...where, criticality: 'CRITICAL' } }),
      this.prisma.outage.count({ where: { ...where, criticality: 'HIGH' } }),
      this.prisma.outage.count({ where: { ...where, criticality: 'MEDIUM' } }),
      this.prisma.outage.count({ where: { ...where, criticality: 'LOW' } }),
    ]);

    // Estatísticas por aplicação
    const outagesByApplication = await this.prisma.outage.groupBy({
      by: ['applicationId'],
      where,
      _count: { id: true },
      _sum: { estimatedDuration: true },
    });

    // Estatísticas por ambiente
    const outagesByEnvironment = await this.prisma.outage.groupBy({
      by: ['applicationId'],
      where,
      _count: { id: true },
    });

    // Estatísticas por localização
    const outagesByLocation = await this.prisma.outage.groupBy({
      by: ['applicationId'],
      where,
      _count: { id: true },
    });

    // Estatísticas por mês
    const outagesByMonth = await this.prisma.outage.groupBy({
      by: ['createdAt'],
      where,
      _count: { id: true },
    });

    // Tempo médio de aprovação
    const approvalTimeStats = await this.prisma.outage.aggregate({
      where: { ...where, status: { in: ['APPROVED', 'REJECTED'] } },
      _avg: { estimatedDuration: true },
      _min: { estimatedDuration: true },
      _max: { estimatedDuration: true },
    });

    // Top aplicações com mais outages
    const topApplicationsRaw = await this.prisma.outage.groupBy({
      by: ['applicationId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Buscar nomes das aplicações
    const topApplications = await Promise.all(
      topApplicationsRaw.map(async (app) => {
        const application = await this.prisma.application.findUnique({
          where: { id: app.applicationId },
          select: { id: true, name: true }
        });
        return {
          ...app,
          application: application
        };
      })
    );

    // Estatísticas de usuários
    const userStats = await this.prisma.outage.groupBy({
      by: ['createdBy'],
      where,
      _count: { id: true },
    });

    return {
      overview: {
        total: totalOutages,
        pending: pendingOutages,
        approved: approvedOutages,
        rejected: rejectedOutages,
        approvalRate: totalOutages > 0 ? (approvedOutages / totalOutages) * 100 : 0,
      },
      criticality: {
        critical: criticalOutages,
        high: highOutages,
        medium: mediumOutages,
        low: lowOutages,
      },
      applications: {
        total: outagesByApplication.length,
        top: topApplications,
        byApplication: outagesByApplication,
      },
      environments: {
        byEnvironment: outagesByEnvironment,
      },
      locations: {
        byLocation: outagesByLocation,
      },
      timeline: {
        byMonth: outagesByMonth,
      },
      performance: {
        averageApprovalTime: approvalTimeStats._avg.estimatedDuration,
        minApprovalTime: approvalTimeStats._min.estimatedDuration,
        maxApprovalTime: approvalTimeStats._max.estimatedDuration,
      },
      users: {
        byUser: userStats,
      },
    };
  }

  async getCompanyOverview(companyId: string) {
    const [
      totalApplications,
      totalUsers,
      totalOutages,
      activeOutages,
    ] = await Promise.all([
      this.prisma.application.count({ where: { companyId } }),
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.outage.count({ where: { companyId } }),
      this.prisma.outage.count({
        where: { companyId, status: { in: ['PENDING', 'APPROVED'] } },
      }),
    ]);

    // Últimas atividades
    const recentOutages = await this.prisma.outage.findMany({
      where: { companyId },
      include: {
        application: { select: { name: true } },
        createdByUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Estatísticas de aprovação
    const approvalStats = await this.prisma.outage.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { status: true },
    });

    return {
      summary: {
        applications: totalApplications,
        users: totalUsers,
        outages: totalOutages,
        activeOutages,
      },
      recentActivity: recentOutages,
      approvalStats,
    };
  }

  async getApplicationPerformance(companyId: string, applicationId: string) {
    const outages = await this.prisma.outage.findMany({
      where: { companyId, applicationId },
      include: {
        approvalWorkflows: {
          include: {
            steps: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular métricas de performance
    const totalOutages = outages.length;
    const approvedOutages = outages.filter(o => o.status === 'APPROVED').length;
    const rejectedOutages = outages.filter(o => o.status === 'REJECTED').length;
    const pendingOutages = outages.filter(o => o.status === 'PENDING').length;

    // Tempo médio de aprovação
    const approvalTimes = outages
      .filter(o => o.status === 'APPROVED' && o.approvalWorkflows)
      .map(o => {
        const completedWorkflows = o.approvalWorkflows.filter(w => w.status === 'APPROVED');
        if (completedWorkflows.length > 0) {
          const workflow = completedWorkflows[completedWorkflows.length - 1];
          const completedSteps = workflow.steps.filter(s => s.status === 'APPROVED' && s.completedAt);
          if (completedSteps.length > 0) {
            const lastCompletedStep = completedSteps[completedSteps.length - 1];
            return new Date(lastCompletedStep.completedAt!).getTime() - new Date(o.createdAt).getTime();
          }
        }
        return 0;
      })
      .filter(time => time > 0);

    const averageApprovalTime = approvalTimes.length > 0
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length
      : 0;

    // Distribuição por criticalidade
    const criticalityDistribution = await this.prisma.outage.groupBy({
      by: ['criticality'],
      where: { companyId, applicationId },
      _count: { criticality: true },
    });

    // Distribuição por ambiente
    const environmentDistribution = await this.prisma.outage.groupBy({
      by: ['applicationId'],
      where: { companyId, applicationId },
      _count: { id: true },
    });

    return {
      summary: {
        total: totalOutages,
        approved: approvedOutages,
        rejected: rejectedOutages,
        pending: pendingOutages,
        approvalRate: totalOutages > 0 ? (approvedOutages / totalOutages) * 100 : 0,
      },
      performance: {
        averageApprovalTime,
        totalApprovalTime: approvalTimes.reduce((sum, time) => sum + time, 0),
        approvalCount: approvalTimes.length,
      },
      distribution: {
        criticality: criticalityDistribution,
        environment: environmentDistribution,
      },
      recentOutages: outages.slice(0, 10),
    };
  }

  async getTrends(companyId: string, period: 'week' | 'month' | 'quarter' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
    }

    const where = {
      companyId,
      createdAt: { gte: startDate },
    };

    // Tendências por dia
    const dailyTrends = await this.prisma.outage.groupBy({
      by: ['createdAt'],
      where,
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Tendências por status
    const statusTrends = await this.prisma.outage.groupBy({
      by: ['status', 'createdAt'],
      where,
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    // Tendências por criticalidade
    const criticalityTrends = await this.prisma.outage.groupBy({
      by: ['criticality', 'createdAt'],
      where,
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      period,
      startDate,
      endDate: now,
      trends: {
        daily: dailyTrends,
        status: statusTrends,
        criticality: criticalityTrends,
      },
    };
  }
}
