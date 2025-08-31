// src/shared/validators/environment.validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IsValidEnvironmentConstraint {
  validate(value: any, args: ValidationArguments) {
    return Array.isArray(value) && 
           Array.isArray(value) && value.every(v => typeof v === 'string');
  }

  defaultMessage(args: ValidationArguments) {
  return `Each environment must be a string.`;
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