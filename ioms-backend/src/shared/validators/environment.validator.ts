// src/shared/validators/environment.validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Environment } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IsValidEnvironmentConstraint {
  validate(value: any, args: ValidationArguments) {
    return Array.isArray(value) && 
           value.every(v => Object.values(Environment).includes(v));
  }

  defaultMessage(args: ValidationArguments) {
    return `Each environment must be one of: ${Object.values(Environment).join(', ')}`;
  }
}

export function IsValidEnvironment(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidEnvironment',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: new IsValidEnvironmentConstraint(),
    });
  };
}