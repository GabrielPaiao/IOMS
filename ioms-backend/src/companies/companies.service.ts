// src/companies/companies.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateCompanyWithAdminDto } from './dto/create-company-with-admin.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  private readonly SALT_ROUNDS = 10;

  async createCompanyWithAdmin(dto: CreateCompanyWithAdminDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verificar se email já existe
      const existingUser = await tx.user.findUnique({
        where: { email: dto.adminEmail },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // 1. Criar a empresa (apenas com name)
      const company = await tx.company.create({
        data: {
          name: dto.companyName,
        },
      });

      // 2. Criar o admin
      const hashedPassword = await bcrypt.hash(dto.adminPassword, this.SALT_ROUNDS);
      const admin = await tx.user.create({
        data: {
          email: dto.adminEmail,
          firstName: dto.adminFirstName,
          lastName: dto.adminLastName,
          password: hashedPassword,
          role: UserRole.ADMIN,
          companyId: company.id,
          isActive: true,
        },
        select: { // Selecionando apenas os campos necessários
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
        }
      });

      return { company, admin };
    });
  }

  async getCompanyDetails(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        applications: {
          include: {
            environments: true,
            locations: {
              include: {
                location: true,
                keyUsers: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}