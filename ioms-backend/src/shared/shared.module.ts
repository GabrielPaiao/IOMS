// src/shared/shared.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { IsUniqueEmailConstraint } from './validators/unique-email.validator';
import { IsUniqueCompanyNameConstraint } from './validators/unique-company.validator';
import { IsValidEnvironmentConstraint } from './validators/environment.validator';

@Module({
  providers: [
    PrismaService,
    IsUniqueEmailConstraint,
    IsUniqueCompanyNameConstraint,
    IsValidEnvironmentConstraint,
  ],
  exports: [
    IsUniqueEmailConstraint,
    IsUniqueCompanyNameConstraint,
    IsValidEnvironmentConstraint,
  ],
})
export class SharedModule {}