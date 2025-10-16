import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetupService } from './system-setup.service';
import { SystemSetupController } from './system-setup.controller';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';
import { FactsFailure } from '../facts-failure/entities/facts-failure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fact, Failure, FactsFailure])
  ],
  controllers: [SystemSetupController],
  providers: [SystemSetupService],
  exports: [SystemSetupService],
})
export class SystemSetupModule {}
