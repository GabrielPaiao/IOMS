import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  create(@Body() createApplicationDto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.create(createApplicationDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  findAll(@Query() query: any, @Request() req) {
    const companyId = req.user.companyId;
    return this.applicationsService.findAll(companyId, query);
  }

  @Get('company/:companyId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  findByCompany(@Param('companyId') companyId: string) {
    return this.applicationsService.getApplicationsByCompany(companyId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getStats(@Param('id') id: string) {
    return this.applicationsService.getApplicationStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @Request() req,
  ) {
    return this.applicationsService.update(id, updateApplicationDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
