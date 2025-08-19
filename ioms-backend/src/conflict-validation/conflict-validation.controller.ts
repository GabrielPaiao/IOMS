import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ConflictValidationService } from './conflict-validation.service';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { ValidateOutageDto } from './dto/validate-outage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('outages/validate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConflictValidationController {
  constructor(private readonly conflictValidationService: ConflictValidationService) {}

  @Post('conflicts')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkTimeConflicts(@Body() conflictCheckDto: ConflictCheckDto) {
    return this.conflictValidationService.checkTimeConflicts(conflictCheckDto);
  }

  @Get('application-conflicts')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkApplicationConflicts(
    @Query('applicationId') applicationId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.conflictValidationService.checkApplicationConflicts(applicationId, startTime, endTime);
  }

  @Get('location-conflicts')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkLocationConflicts(
    @Query('locationId') locationId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.conflictValidationService.checkLocationConflicts(locationId, startTime, endTime);
  }

  @Get('environment-conflicts')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkEnvironmentConflicts(
    @Query('environmentIds') environmentIds: string[],
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.conflictValidationService.checkEnvironmentConflicts(environmentIds, startTime, endTime);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  validateOutage(@Body() validateOutageDto: ValidateOutageDto) {
    return this.conflictValidationService.validateOutage(validateOutageDto);
  }

  @Get('resource-availability')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkResourceAvailability(
    @Query('applicationId') applicationId: string,
    @Query('locationId') locationId: string,
    @Query('environmentIds') environmentIds: string[],
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.conflictValidationService.checkResourceAvailability(
      applicationId,
      locationId,
      environmentIds,
      startTime,
      endTime
    );
  }

  @Get('suggest-slots')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  suggestAlternativeSlots(
    @Query('applicationId') applicationId: string,
    @Query('locationId') locationId: string,
    @Query('environmentIds') environmentIds: string[],
    @Query('preferredStart') preferredStart: string,
    @Query('preferredEnd') preferredEnd: string,
    @Query('duration') duration: number
  ) {
    return this.conflictValidationService.suggestAlternativeSlots(
      applicationId,
      locationId,
      environmentIds,
      preferredStart,
      preferredEnd,
      duration
    );
  }

  @Post('business-rules')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkBusinessRules(@Body() outage: any) {
    return this.conflictValidationService.checkBusinessRules(outage);
  }
}
