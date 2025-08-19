// src/shared/validators/unique-company.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsUniqueCompanyName', async: true })
@Injectable()
export class IsUniqueCompanyNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private prisma: PrismaService) {} // Injeção de dependência

  async validate(name: string): Promise<boolean> {
    if (!this.prisma) {
      throw new Error('PrismaService not injected');
    }
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    return !company;
  }

  defaultMessage(): string {
    return 'Company name already exists';
  }
}

export function IsUniqueCompanyName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueCompanyNameConstraint,
    });
  };
}