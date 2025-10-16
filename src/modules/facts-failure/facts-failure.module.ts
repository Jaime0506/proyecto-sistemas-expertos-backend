import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactsFailureService } from './facts-failure.service';
import { FactsFailureController } from './facts-failure.controller';
import { FactsFailure } from './entities/facts-failure.entity';
import { Fact } from '../facts/entities/fact.entity';
import { Failure } from '../failures/entities/failure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FactsFailure, Fact, Failure])
  ],
  controllers: [FactsFailureController],
  providers: [FactsFailureService],
  exports: [FactsFailureService],
})
export class FactsFailureModule {}
