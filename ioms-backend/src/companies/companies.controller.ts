// src/companies/companies.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyWithAdminDto } from './dto/create-company-with-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async createCompanyWithAdmin(@Body() dto: CreateCompanyWithAdminDto) {
    return this.companiesService.createCompanyWithAdmin(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCompany(@Param('id') id: string) {
    return this.companiesService.getCompanyDetails(id);
  }
}