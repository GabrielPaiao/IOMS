import { Module } from '@nestjs/common';
import { ConflictValidationController } from './conflict-validation.controller';
import { ConflictValidationService } from './conflict-validation.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ConflictValidationController],
  providers: [ConflictValidationService],
  exports: [ConflictValidationService],
})
export class ConflictValidationModule {}
