import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { ValidateOutageDto } from './dto/validate-outage.dto';

@Injectable()
export class ConflictValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async checkTimeConflicts(conflictCheckDto: ConflictCheckDto) {
    const { applicationId, locationId, environmentIds, startTime, endTime, excludeOutageId } = conflictCheckDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Buscar outages conflitantes
    const conflictingOutages = await this.prisma.outage.findMany({
      where: {
        applicationId,
        // locationId não existe no schema, vamos usar application.locations
        application: {
          locations: {
            some: {
              code: locationId
            }
          }
        },
        // environments não existe no schema, vamos usar application.environments
        application: {
          environments: {
            some: {
              environment: { in: environmentIds }
            }
          }
        },
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
        status: { in: ['PENDING', 'APPROVED'] },
        id: { not: excludeOutageId }
      },
      include: {
        application: {
          include: {
            locations: true,
            environments: true
          }
        }
      }
    });

    const conflicts = conflictingOutages.map(outage => ({
      id: outage.id,
      conflictingOutageId: outage.id,
      conflictingOutageTitle: outage.reason,
      conflictType: this.determineConflictType(start, end, outage.scheduledStart, outage.scheduledEnd),
      severity: this.calculateSeverity(outage.criticality, start, end, outage.scheduledStart, outage.scheduledEnd),
      description: this.generateConflictDescription(outage, start, end),
      outage
    }));

    const hasConflicts = conflicts.length > 0;
    const severity = hasConflicts ? this.getHighestSeverity(conflicts) : 'none';
    const recommendations = this.generateRecommendations(conflicts, start, end);

    return {
      hasConflicts,
      conflicts,
      severity,
      recommendations
    };
  }

  async checkApplicationConflicts(applicationId: string, startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflicts = await this.prisma.outage.findMany({
      where: {
        applicationId,
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
        status: { in: ['PENDING', 'APPROVED'] }
      },
      include: {
        application: {
          include: {
            locations: true,
            environments: true
          }
        }
      }
    });

    return conflicts.map(outage => ({
      id: outage.id,
      conflictingOutageId: outage.id,
      conflictingOutageTitle: outage.reason,
      conflictType: 'same_application',
      severity: this.calculateSeverity(outage.criticality, start, end, outage.scheduledStart, outage.scheduledEnd),
      description: `Conflict with outage "${outage.reason}" for application ${outage.application.name}`,
      outage
    }));
  }

  async checkLocationConflicts(locationId: string, startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflicts = await this.prisma.outage.findMany({
      where: {
        application: {
          locations: {
            some: {
              code: locationId
            }
          }
        },
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
        status: { in: ['PENDING', 'APPROVED'] }
      },
      include: {
        application: {
          include: {
            locations: true,
            environments: true
          }
        }
      }
    });

    return conflicts.map(outage => ({
      id: outage.id,
      conflictingOutageId: outage.id,
      conflictingOutageTitle: outage.reason,
      conflictType: 'same_location',
      severity: this.calculateSeverity(outage.criticality, start, end, outage.scheduledStart, outage.scheduledEnd),
      description: `Conflict with outage "${outage.reason}" for application ${outage.application.name}`,
      outage
    }));
  }

  async checkEnvironmentConflicts(environmentIds: string[], startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflicts = await this.prisma.outage.findMany({
      where: {
        application: {
          environments: {
            some: {
              environment: { in: environmentIds }
            }
          }
        },
        scheduledStart: { lt: end },
        scheduledEnd: { gt: start },
        status: { in: ['PENDING', 'APPROVED'] }
      },
      include: {
        application: {
          include: {
            locations: true,
            environments: true
          }
        }
      }
    });

    return conflicts.map(outage => ({
      id: outage.id,
      conflictingOutageId: outage.id,
      conflictingOutageTitle: outage.reason,
      conflictType: 'same_environment',
      severity: this.calculateSeverity(outage.criticality, start, end, outage.scheduledStart, outage.scheduledEnd),
      description: `Conflict with outage "${outage.reason}" in environment(s) ${outage.application.environments.map(e => e.environment).join(', ')}`,
      outage
    }));
  }

  async validateOutage(validateOutageDto: ValidateOutageDto) {
    const conflicts = await this.checkTimeConflicts({
      applicationId: validateOutageDto.applicationId,
      locationId: validateOutageDto.locationId,
      environmentIds: validateOutageDto.environments,
      startTime: validateOutageDto.start,
      endTime: validateOutageDto.end,
      excludeOutageId: validateOutageDto.id
    });

    const warnings = this.generateWarnings(validateOutageDto);
    const recommendations = this.generateRecommendations(conflicts.conflicts, new Date(validateOutageDto.start), new Date(validateOutageDto.end));

    return {
      isValid: !conflicts.hasConflicts,
      conflicts: conflicts.conflicts,
      warnings,
      recommendations
    };
  }

  async checkResourceAvailability(
    applicationId: string,
    locationId: string,
    environmentIds: string[],
    startTime: string,
    endTime: string
  ) {
    const conflicts = await this.checkTimeConflicts({
      applicationId,
      locationId,
      environmentIds,
      startTime,
      endTime
    });

    const available = !conflicts.hasConflicts;
    const alternativeSlots = available ? [] : await this.suggestAlternativeSlots(
      applicationId,
      locationId,
      environmentIds,
      startTime,
      endTime,
      this.calculateDuration(startTime, endTime)
    );

    return {
      available,
      alternativeSlots,
      conflicts: conflicts.conflicts
    };
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)); // duração em minutos
  }

  private async suggestAlternativeSlots(
    applicationId: string,
    locationId: string,
    environmentIds: string[],
    startTime: string,
    endTime: string,
    duration: number
  ) {
    const suggestions: Array<{ start: string; end: string; score: number; reason: string }> = [];
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Buscar slots disponíveis nas próximas 24 horas
    for (let i = 1; i <= 24; i++) {
      const slotStart = new Date(start.getTime() + (i * 60 * 60 * 1000));
      const slotEnd = new Date(slotStart.getTime() + (duration * 60 * 1000));

      const conflicts = await this.checkTimeConflicts({
        applicationId,
        locationId,
        environmentIds,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString()
      });

      if (!conflicts.hasConflicts) {
        suggestions.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          score: 100 - i, // Quanto mais próximo, maior a pontuação
          reason: `Available slot starting at ${slotStart.toLocaleString()}`
        });
      }
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private generateWarnings(validateOutageDto: ValidateOutageDto): string[] {
    const warnings: string[] = [];
    const start = new Date(validateOutageDto.start);
    const end = new Date(validateOutageDto.end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // duração em horas

    // Verificar regras de negócio
    if (validateOutageDto.criticality === 'CRITICAL' && duration > 4) {
      warnings.push('Critical outages cannot exceed 4 hours');
    }

    if (validateOutageDto.criticality === 'HIGH' && duration > 8) {
      warnings.push('High criticality outages cannot exceed 8 hours');
    }

    // Verificar horário de negócio
    const dayOfWeek = start.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      warnings.push('Outage scheduled for weekend - consider business impact');
    }

    const hour = start.getHours();
    if (hour >= 9 && hour <= 17) {
      warnings.push('Outage scheduled during business hours - consider user impact');
    }

    return warnings;
  }

  private generateRecommendations(conflicts: any[], start: Date, end: Date): string[] {
    const recommendations: string[] = [];

    if (conflicts.length > 0) {
      recommendations.push('Consider rescheduling to avoid conflicts');
      recommendations.push('Review criticality levels of conflicting outages');

      const highSeverityConflicts = conflicts.filter(c => c.severity === 'high');
      if (highSeverityConflicts.length > 0) {
        recommendations.push('High severity conflicts detected - immediate attention required');
      }
    }

    return recommendations;
  }

  private determineConflictType(start1: Date, end1: Date, start2: Date, end2: Date): string {
    if (start1 < start2 && end1 > end2) {
      return 'complete_overlap';
    } else if (start1 < start2 && end1 > start2) {
      return 'start_overlap';
    } else if (start1 < end2 && end1 > end2) {
      return 'end_overlap';
    } else {
      return 'exact_match';
    }
  }

  private calculateSeverity(criticality: string, start1: Date, end1: Date, start2: Date, end2: Date): string {
    const overlap = Math.min(end1.getTime(), end2.getTime()) - Math.max(start1.getTime(), start2.getTime());
    const overlapHours = overlap / (1000 * 60 * 60);

    if (criticality === 'CRITICAL' || overlapHours > 2) {
      return 'high';
    } else if (criticality === 'HIGH' || overlapHours > 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private getHighestSeverity(conflicts: any[]): string {
    if (conflicts.some(c => c.severity === 'high')) {
      return 'high';
    } else if (conflicts.some(c => c.severity === 'medium')) {
      return 'medium';
    } else if (conflicts.some(c => c.severity === 'low')) {
      return 'low';
    } else {
      return 'none';
    }
  }

  private generateConflictDescription(outage: any, start: Date, end: Date): string {
    const overlap = Math.min(end.getTime(), outage.scheduledEnd.getTime()) - Math.max(start.getTime(), outage.scheduledStart.getTime());
    const overlapHours = Math.round(overlap / (1000 * 60 * 60) * 100) / 100;

    return `Time overlap of ${overlapHours} hours with outage "${outage.reason}"`;
  }
}
