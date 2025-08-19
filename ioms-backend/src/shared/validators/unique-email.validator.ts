// src/shared/validators/unique-email.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsUniqueEmail', async: true })
@Injectable()
export class IsUniqueEmailConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {} // Injeção de dependência

  async validate(email: string): Promise<boolean> {
    if (!this.prisma) {
      throw new Error('PrismaService not injected');
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return !user;
  }

  defaultMessage(): string {
    return 'Email already in use';
  }
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueEmailConstraint,
    });
  };
}