import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ChangeHistoryFiltersDto } from './dto/change-history-filters.dto';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class ChangeHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOutageChangeHistory(outageId: string) {
    const history = await this.prisma.outageHistory.findMany({
      where: { outageId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return history;
  }

  async getChangeHistory(filters: ChangeHistoryFiltersDto) {
    const where: any = {};

    if (filters.outageId) {
      where.outageId = filters.outageId;
    }

    if (filters.field) {
      where.field = filters.field;
    }

    if (filters.changeType) {
      where.changeType = { in: filters.changeType };
    }

    if (filters.changedBy) {
      where.userId = filters.changedBy;
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end)
      };
    }

    const [changes, total] = await Promise.all([
      this.prisma.outageHistory.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          outage: {
            select: { id: true, title: true, application: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.outageHistory.count({ where })
    ]);

    return {
      changes,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async getChangeById(id: string) {
    const change = await this.prisma.outageHistory.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        outage: {
          select: { id: true, title: true, application: { select: { name: true } } }
        }
      }
    });

    if (!change) {
      throw new NotFoundException('Change history record not found');
    }

    return change;
  }

  async getFieldChangeSummary(outageId: string) {
    const summary = await this.prisma.outageHistory.groupBy({
      by: ['field'],
      where: { outageId },
      _count: { field: true },
      _max: { createdAt: true },
      _min: { createdAt: true }
    });

    const result = await Promise.all(
      summary.map(async (item) => {
        const lastChange = await this.prisma.outageHistory.findFirst({
          where: { outageId, field: item.field },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        });

        const mostCommonValue = await this.prisma.outageHistory.groupBy({
          by: ['newValue'],
          where: { outageId, field: item.field },
          _count: { newValue: true },
          orderBy: { _count: { newValue: 'desc' } },
          take: 1
        });

        return {
          field: item.field,
          changeCount: item._count.field,
          lastChange: item._max.createdAt.toISOString(),
          lastChangedBy: `${lastChange?.user.firstName} ${lastChange?.user.lastName}`,
          mostCommonValue: mostCommonValue[0]?.newValue || null
        };
      })
    );

    return result;
  }

  async getAuditTrail(outageId: string) {
    const [changes, summary] = await Promise.all([
      this.getOutageChangeHistory(outageId),
      this.getFieldChangeSummary(outageId)
    ]);

    const uniqueUsers = [...new Set(changes.map(c => c.user.id))];
    const dateRange = changes.length > 0 ? {
      start: changes[changes.length - 1].createdAt.toISOString(),
      end: changes[0].createdAt.toISOString()
    } : { start: new Date().toISOString(), end: new Date().toISOString() };

    return {
      outageId,
      changes,
      summary: {
        totalChanges: changes.length,
        uniqueUsers,
        dateRange
      }
    };
  }

  async getUserChangeHistory(userId: string, filters: Omit<ChangeHistoryFiltersDto, 'changedBy'>) {
    const where = { ...filters, userId };

    const [changes, total] = await Promise.all([
      this.prisma.outageHistory.findMany({
        where,
        include: {
          outage: {
            select: { id: true, title: true, application: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.outageHistory.count({ where })
    ]);

    const outagesAffected = [...new Set(changes.map(c => c.outageId))].length;
    const fieldCounts = changes.reduce((acc, change) => {
      acc[change.field] = (acc[change.field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostChangedFields = Object.entries(fieldCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([field]) => field);

    return {
      changes,
      total,
      summary: {
        totalChanges: total,
        outagesAffected,
        mostChangedFields
      }
    };
  }

  async getFieldChangeHistory(field: string, filters: Omit<ChangeHistoryFiltersDto, 'field'>) {
    const where = { ...filters, field };

    const [changes, total] = await Promise.all([
      this.prisma.outageHistory.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true } },
          outage: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      this.prisma.outageHistory.count({ where })
    ]);

    const uniqueUsers = [...new Set(changes.map(c => c.userId))];
    const valueCounts = changes.reduce((acc, change) => {
      acc[change.newValue] = (acc[change.newValue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valueDistribution = Object.entries(valueCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([value, count]) => ({ value, count }));

    return {
      changes,
      total,
      summary: {
        totalChanges: total,
        uniqueUsers,
        valueDistribution
      }
    };
  }

  async addComment(addCommentDto: AddCommentDto) {
    const { outageId, comment, type, userId } = addCommentDto;

    // Verificar se o outage existe
    const outage = await this.prisma.outage.findUnique({
      where: { id: outageId }
    });

    if (!outage) {
      throw new NotFoundException('Outage not found');
    }

    // Criar registro de comentário
    const changeRecord = await this.prisma.outageHistory.create({
      data: {
        outageId,
        field: 'comment',
        oldValue: null,
        newValue: comment,
        changeType: type || 'comment',
        userId,
        reason: 'User comment added'
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    return changeRecord;
  }

  async addChangeRecord(data: {
    outageId: string;
    field: string;
    oldValue: any;
    newValue: any;
    changeType: string;
    userId: string;
    reason?: string;
  }) {
    return this.prisma.outageHistory.create({
      data: {
        ...data,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValue: data.newValue ? JSON.stringify(data.newValue) : null
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  async getChangeStatistics(companyId?: string, dateRange?: { start: string; end: string }) {
    const where: any = {};

    if (companyId) {
      where.outage = {
        application: { companyId }
      };
    }

    if (dateRange) {
      where.createdAt = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      };
    }

    const [totalChanges, changesByType, changesByField, changesByUser] = await Promise.all([
      this.prisma.outageHistory.count({ where }),
      this.prisma.outageHistory.groupBy({
        by: ['changeType'],
        where,
        _count: { changeType: true }
      }),
      this.prisma.outageHistory.groupBy({
        by: ['field'],
        where,
        _count: { field: true }
      }),
      this.prisma.outageHistory.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true }
      })
    ]);

    return {
      totalChanges,
      changesByType: changesByType.map(item => ({
        type: item.changeType,
        count: item._count.changeType
      })),
      changesByField: changesByField.map(item => ({
        field: item.field,
        count: item._count.field
      })),
      changesByUser: changesByUser.map(item => ({
        userId: item.userId,
        count: item._count.userId
      }))
    };
  }
}
